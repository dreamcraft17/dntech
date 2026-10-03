'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bot, Languages, Pencil, RefreshCw, Trash2, UserCheck, X } from 'lucide-react';
import AdminCrudPage from '@/components/admin/AdminCrudPage';
import { BlogGenerator } from '@/components/admin/BlogGenerator';
import { apiFetch } from '@/lib/api';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Textarea } from '@/components/ui/Input';

/** Admin UI stays Indonesian-only; it manages both published languages. */
const TARGET_LOCALE = 'en';

interface AdminBlogListItem {
  id: string;
  title: string;
  slug?: string;
  status?: string;
  availableLocales?: string[];
}

interface BlogTranslation {
  locale: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  isMachine?: boolean;
  updatedAt?: string;
}

const EMPTY_TRANSLATION: BlogTranslation = {
  locale: TARGET_LOCALE,
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  seoTitle: '',
  seoDescription: '',
};

function toTranslationList(payload: unknown): BlogTranslation[] {
  if (Array.isArray(payload)) return payload as BlogTranslation[];
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.translations)) return record.translations as BlogTranslation[];
    return Object.entries(record)
      .filter(([, value]) => value && typeof value === 'object')
      .map(([locale, value]) => {
        const translation = value as BlogTranslation;
        return { ...translation, locale: translation.locale ?? locale };
      });
  }
  return [];
}

function TranslationBadge({ translation }: { translation: BlogTranslation | undefined }) {
  if (!translation) {
    return (
      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
        Belum ada terjemahan
      </span>
    );
  }
  return translation.isMachine ? (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
      <Bot className="h-3.5 w-3.5" /> Hasil AI — belum direview
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800">
      <UserCheck className="h-3.5 w-3.5" /> Disunting manusia
    </span>
  );
}

function BlogTranslationsPanel() {
  const [posts, setPosts] = useState<AdminBlogListItem[]>([]);
  const [translations, setTranslations] = useState<Record<string, BlogTranslation[]>>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ postId: string; postTitle: string; draft: BlogTranslation } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadTranslations = useCallback(async (postId: string) => {
    const payload = await apiFetch<unknown>(`/admin/blog/${postId}/translations`);
    setTranslations((prev) => ({ ...prev, [postId]: toTranslationList(payload) }));
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<AdminBlogListItem[]>('/admin/blog');
      const list = Array.isArray(data) ? data : [];
      setPosts(list);
      await Promise.all(
        list.map((post) => loadTranslations(post.id).catch(() => undefined)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat daftar terjemahan');
    } finally {
      setInitialLoading(false);
    }
  }, [loadTranslations]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      load().catch(console.error);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [load]);

  function translationFor(postId: string) {
    return translations[postId]?.find((item) => item.locale === TARGET_LOCALE);
  }

  async function generate(post: AdminBlogListItem) {
    if (!confirm(`Buat terjemahan Inggris untuk "${post.title}" dengan AI?`)) return;
    setError('');
    setBusyId(post.id);
    try {
      await apiFetch(`/admin/blog/${post.id}/translations/${TARGET_LOCALE}/generate`, { method: 'POST' });
      await loadTranslations(post.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat terjemahan');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(post: AdminBlogListItem) {
    if (!confirm(`Hapus terjemahan Inggris untuk "${post.title}"?`)) return;
    setError('');
    setBusyId(post.id);
    try {
      await apiFetch(`/admin/blog/${post.id}/translations/${TARGET_LOCALE}`, { method: 'DELETE' });
      await loadTranslations(post.id);
      setEditing((current) => (current?.postId === post.id ? null : current));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus terjemahan');
    } finally {
      setBusyId(null);
    }
  }

  async function save() {
    if (!editing) return;
    setError('');
    setSaving(true);
    try {
      const { draft } = editing;
      await apiFetch(`/admin/blog/${editing.postId}/translations/${TARGET_LOCALE}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: draft.title,
          slug: draft.slug,
          excerpt: draft.excerpt,
          content: draft.content,
          seoTitle: draft.seoTitle,
          seoDescription: draft.seoDescription,
          // Saving from the editor means a human has reviewed this copy.
          isMachine: false,
        }),
      });
      await loadTranslations(editing.postId);
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan terjemahan');
    } finally {
      setSaving(false);
    }
  }

  function startEdit(post: AdminBlogListItem) {
    const existing = translationFor(post.id);
    setEditing({
      postId: post.id,
      postTitle: post.title,
      draft: { ...EMPTY_TRANSLATION, ...(existing ?? {}), locale: TARGET_LOCALE },
    });
  }

  function patchDraft(patch: Partial<BlogTranslation>) {
    setEditing((current) => (current ? { ...current, draft: { ...current.draft, ...patch } } : current));
  }

  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Languages className="h-5 w-5 text-blue-900" /> Terjemahan Inggris
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Artikel ditulis dalam Bahasa Indonesia. Versi Inggris di sini yang tampil di rute /en.
          </p>
        </div>
        <Button variant="secondary" onClick={() => load().catch(console.error)}>
          <RefreshCw className="h-4 w-4" /> Muat ulang
        </Button>
      </div>

      {error && <Alert variant="error" className="mb-4">{error}</Alert>}

      {editing && (
        <Card className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Terjemahan Inggris — {editing.postTitle}</h3>
              <p className="mt-1 text-xs text-gray-500">
                Menyimpan dari form ini menandai terjemahan sebagai sudah direview manusia.
              </p>
            </div>
            <button type="button" onClick={() => setEditing(null)} aria-label="Tutup editor terjemahan">
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Judul (EN)" value={editing.draft.title ?? ''} onChange={(e) => patchDraft({ title: e.target.value })} required />
            <Input label="Slug (EN)" value={editing.draft.slug ?? ''} onChange={(e) => patchDraft({ slug: e.target.value })} />
            <Textarea label="Cuplikan (EN)" rows={3} className="md:col-span-2" value={editing.draft.excerpt ?? ''} onChange={(e) => patchDraft({ excerpt: e.target.value })} />
            <Textarea label="Konten HTML (EN)" rows={10} className="md:col-span-2 font-mono text-xs" value={editing.draft.content ?? ''} onChange={(e) => patchDraft({ content: e.target.value })} required />
            <Input label="Meta Title (EN)" value={editing.draft.seoTitle ?? ''} onChange={(e) => patchDraft({ seoTitle: e.target.value })} />
            <Textarea label="Meta Description (EN)" rows={3} value={editing.draft.seoDescription ?? ''} onChange={(e) => patchDraft({ seoDescription: e.target.value })} />
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={save} loading={saving}>Simpan terjemahan</Button>
            <Button variant="secondary" onClick={() => setEditing(null)}>Batal</Button>
          </div>
        </Card>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Artikel (ID)</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status terjemahan EN</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const translation = translationFor(post.id);
              return (
                <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{post.title}</td>
                  <td className="px-4 py-3">
                    <TranslationBadge translation={translation} />
                    {translation?.slug && (
                      <div className="mt-1 text-xs text-gray-500">/en/blog/{translation.slug}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!translation && (
                      <button
                        onClick={() => generate(post)}
                        disabled={busyId === post.id}
                        className="p-1 text-gray-400 hover:text-blue-900 disabled:opacity-50"
                        aria-label={`Buat terjemahan Inggris untuk ${post.title}`}
                        title="Buat dengan AI"
                      >
                        <Bot className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => startEdit(post)}
                      className="ml-1 p-1 text-gray-400 hover:text-blue-900"
                      aria-label={`Ubah terjemahan Inggris untuk ${post.title}`}
                      title="Ubah terjemahan"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    {translation && (
                      <button
                        onClick={() => remove(post)}
                        disabled={busyId === post.id}
                        className="ml-1 p-1 text-gray-400 hover:text-red-600 disabled:opacity-50"
                        aria-label={`Hapus terjemahan Inggris untuk ${post.title}`}
                        title="Hapus terjemahan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {initialLoading && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-900 border-t-transparent" /> Memuat terjemahan...
          </div>
        )}
        {!initialLoading && posts.length === 0 && (
          <p className="py-8 text-center text-gray-500">Belum ada artikel</p>
        )}
      </div>
    </section>
  );
}

export default function AdminBlogPage() {
  return (
    <>
      <AdminCrudPage
        title="Artikel Blog"
        endpoint="blog"
        defaultItem={{ title: '', content: '', excerpt: '', category: '', featuredImageId: '', featuredImageIdUrl: '', status: 'draft', seoTitle: '', seoDescription: '' }}
        fields={[
          { key: 'title', label: 'Judul', required: true },
          { key: 'category', label: 'Kategori' },
          { key: 'excerpt', label: 'Cuplikan', type: 'textarea' },
          { key: 'content', label: 'Konten (HTML)', type: 'textarea', required: true },
          { key: 'featuredImageId', label: 'Gambar Utama', type: 'image', aiGenerate: true },
          { key: 'status', label: 'Status', type: 'select', options: [{ value: 'draft', label: 'Draf' }, { value: 'published', label: 'Diterbitkan' }, { value: 'scheduled', label: 'Terjadwal' }] },
          { key: 'seoTitle', label: 'Meta Title' },
          { key: 'seoDescription', label: 'Meta Description', type: 'textarea' },
        ]}
        renderExtraActions={({ setEditing, defaultItem }) => (
          <BlogGenerator onGenerated={(draft) => setEditing({ ...defaultItem, ...draft, featuredImageIdUrl: draft.featuredImageUrl })} />
        )}
        publishable
      />
      <BlogTranslationsPanel />
    </>
  );
}

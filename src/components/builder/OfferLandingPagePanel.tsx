import { useState, useEffect } from 'react';
import { Plus, Edit, Eye, Trash2, Link as LinkIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { EnhancedPageBuilder } from './EnhancedPageBuilder';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../lib/toast-context';

interface LandingPage {
  id: string;
  slug: string;
  status: string;
  config: any;
  created_at: string;
}

interface OfferLandingPagePanelProps {
  offerId?: string;
}

export function OfferLandingPagePanel({ offerId }: OfferLandingPagePanelProps) {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (offerId) {
      loadLandingPages();
    }
  }, [offerId]);

  async function loadLandingPages() {
    if (!offerId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('offer_id', offerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLandingPages(data || []);
    } catch (error) {
      console.error('Error loading landing pages:', error);
      toast({ description: 'Failed to load landing pages', variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateNew() {
    if (!offerId) {
      toast({ description: 'Please save the offer first before creating a landing page', variant: 'error' });
      return;
    }

    const slug = prompt('Enter URL slug for the landing page (e.g., "solar-offer"):');
    if (!slug) return;

    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .insert({
          offer_id: offerId,
          slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
          status: 'draft',
          config: {
            sections: []
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast({ description: 'Landing page created successfully!', variant: 'success' });
      await loadLandingPages();
      setSelectedPage(data);
      setShowBuilder(true);
    } catch (error) {
      console.error('Error creating landing page:', error);
      toast({ description: 'Failed to create landing page', variant: 'error' });
    }
  }

  async function handleEdit(page: LandingPage) {
    setSelectedPage(page);
    setShowBuilder(true);
  }

  async function handleDelete(pageId: string) {
    if (!confirm('Are you sure you want to delete this landing page?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('landing_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      toast({ description: 'Landing page deleted successfully!', variant: 'success' });
      await loadLandingPages();
    } catch (error) {
      console.error('Error deleting landing page:', error);
      toast({ description: 'Failed to delete landing page', variant: 'error' });
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active':
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'draft':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  }

  if (showBuilder && selectedPage) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border bg-card flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Editing Landing Page</h3>
            <p className="text-sm text-muted-foreground">{selectedPage.slug}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setShowBuilder(false);
              setSelectedPage(null);
              loadLandingPages();
            }}
          >
            Back to List
          </Button>
        </div>
        <div className="flex-1 overflow-hidden">
          <EnhancedPageBuilder
            initialSections={selectedPage.config?.sections || []}
            onSave={async (sections) => {
              try {
                const { error } = await supabase
                  .from('landing_pages')
                  .update({
                    config: {
                      ...selectedPage.config,
                      sections
                    }
                  })
                  .eq('id', selectedPage.id);

                if (error) throw error;

                toast({ description: 'Landing page saved successfully!', variant: 'success' });
                await loadLandingPages();
              } catch (error) {
                console.error('Error saving landing page:', error);
                toast({ description: 'Failed to save landing page', variant: 'error' });
                throw error;
              }
            }}
          />
        </div>
      </div>
    );
  }

  if (!offerId) {
    return (
      <div className="p-6 text-center">
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Please save this offer first before creating landing pages.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Create and manage landing pages that lead into your offer form. Each landing page can have its own design using the drag-and-drop builder.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Landing Pages for this Offer</h3>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Landing Page
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : landingPages.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-border rounded-lg">
          <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No landing pages yet</p>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Landing Page
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {landingPages.map((page) => (
            <div
              key={page.id}
              className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors bg-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium">/{page.slug}</h4>
                    <Badge className={getStatusColor(page.status)}>
                      {page.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {page.config?.sections?.length || 0} sections
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/lp/${page.slug}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(page)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(page.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

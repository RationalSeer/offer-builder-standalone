import { PageSection } from '../../types/pageBuilder';

export interface SectionRendererProps {
  section: PageSection;
  isEditing?: boolean;
  onContentChange?: (content: any) => void;
  onClick?: () => void;
}

export function SectionRenderer({ section, isEditing = false, onContentChange, onClick }: SectionRendererProps) {
  // Minimal stub implementation - can be expanded later with full section renderers
  return (
    <div 
      className="p-8 bg-muted/30 border-2 border-dashed border-border rounded-lg text-center"
      onClick={onClick}
    >
      <p className="text-muted-foreground">
        Section: {section.type}
      </p>
      {section.content?.title && (
        <h3 className="text-lg font-semibold mt-2">{section.content.title}</h3>
      )}
      {section.content?.description && (
        <p className="text-sm text-muted-foreground mt-1">{section.content.description}</p>
      )}
    </div>
  );
}


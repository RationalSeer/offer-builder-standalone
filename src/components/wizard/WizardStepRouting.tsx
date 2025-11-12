import { useState } from 'react';
import { Webhook, Mail, Plus, Trash2, Check } from 'lucide-react';

interface WizardStepRoutingProps {
  routing: {
    webhook_url?: string;
    email_notifications?: string[];
  };
  onRoutingChange: (routing: any) => void;
}

export function WizardStepRouting({ routing, onRoutingChange }: WizardStepRoutingProps) {
  const [newEmail, setNewEmail] = useState('');

  function addEmail() {
    if (!newEmail.trim()) return;

    const emails = routing.email_notifications || [];
    if (!emails.includes(newEmail.trim())) {
      onRoutingChange({
        ...routing,
        email_notifications: [...emails, newEmail.trim()],
      });
      setNewEmail('');
    }
  }

  function removeEmail(email: string) {
    onRoutingChange({
      ...routing,
      email_notifications: (routing.email_notifications || []).filter((e) => e !== email),
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Lead Routing & Notifications
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Configure how leads are delivered and who gets notified
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          <Webhook size={18} />
          Webhook URL (Optional)
        </label>
        <input
          type="url"
          value={routing.webhook_url || ''}
          onChange={(e) =>
            onRoutingChange({ ...routing, webhook_url: e.target.value })
          }
          placeholder="https://your-api.com/webhook"
          className="w-full px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Send lead data to your CRM or custom endpoint in real-time
        </p>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          <Mail size={18} />
          Email Notifications
        </label>

        <div className="flex gap-2 mb-3">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addEmail();
              }
            }}
            placeholder="email@example.com"
            className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={addEmail}
            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            Add
          </button>
        </div>

        {routing.email_notifications && routing.email_notifications.length > 0 ? (
          <div className="space-y-2">
            {routing.email_notifications.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm text-slate-900 dark:text-white">{email}</span>
                </div>
                <button
                  onClick={() => removeEmail(email)}
                  className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 text-sm">
            No email notifications configured. Add emails to receive lead alerts.
          </div>
        )}

        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          These emails will receive instant notifications when new leads are captured
        </p>
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Advanced Routing Options
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
          After creation, you can configure:
        </p>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li className="flex items-center gap-2">
            <Check size={16} />
            Multi-buyer lead distribution
          </li>
          <li className="flex items-center gap-2">
            <Check size={16} />
            Conditional routing based on answers
          </li>
          <li className="flex items-center gap-2">
            <Check size={16} />
            Quality score filtering
          </li>
          <li className="flex items-center gap-2">
            <Check size={16} />
            Duplicate lead detection
          </li>
        </ul>
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-start gap-3">
          <Check size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
              You're All Set!
            </h4>
            <p className="text-sm text-green-700 dark:text-green-300">
              Click "Create Offer" to finish setup. You can customize everything further in the
              advanced editor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

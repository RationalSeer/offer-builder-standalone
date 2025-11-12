import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, AlertCircle } from 'lucide-react';
import { InhouseOffer, OfferStep, OfferSession } from '../../types/inhouseOffer';
import {
  getOfferBySlug,
  getOfferSteps,
  createOfferSession,
  updateOfferSession,
  saveOfferResponse,
  completeOfferSession,
  getOfferSession,
  getSessionResponses,
} from '../../services/offerService';
import { supabase } from '../../lib/supabase';

interface OfferRendererProps {
  offerSlug?: string;
}

export function OfferRenderer({ offerSlug: propSlug }: OfferRendererProps) {
  const { slug: urlSlug } = useParams<{ slug: string }>();
  const offerSlug = propSlug || urlSlug || '';
  const [offer, setOffer] = useState<InhouseOffer | null>(null);
  const [steps, setSteps] = useState<OfferStep[]>([]);
  const [session, setSession] = useState<OfferSession | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    initializeOffer();
  }, [offerSlug]);

  async function initializeOffer() {
    try {
      setLoading(true);
      setError(null);

      console.log('=== OfferRenderer: Initializing ===');
      console.log('Offer slug:', offerSlug);

      // Check authentication state
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Auth session:', session ? 'Authenticated' : 'Anonymous');

      // Try to load the offer
      console.log('Loading offer with slug:', offerSlug);
      const offerData = await getOfferBySlug(offerSlug);
      console.log('Offer data:', offerData);

      if (!offerData) {
        console.error('Offer not found in database');
        if (!session) {
          setError('This offer is not published yet. Please sign in to view draft offers.');
        } else {
          setError('Offer not found. Please check the URL or contact support.');
        }
        return;
      }

      // Check if offer is accessible
      if (offerData.status === 'draft' && !session) {
        console.warn('Draft offer accessed without authentication');
        setError('This offer is in draft mode and not publicly available yet.');
        return;
      }

      console.log('Loading steps for offer:', offerData.id);
      const stepsData = await getOfferSteps(offerData.id);
      console.log('Steps loaded:', stepsData);
      setOffer(offerData);
      setSteps(stepsData);

      const urlParams = new URLSearchParams(window.location.search);
      const existingSessionId = localStorage.getItem(`offer_session_${offerSlug}`);

      let sessionData: OfferSession;

      if (existingSessionId) {
        console.log('Found existing session:', existingSessionId);
        const existing = await getOfferSession(existingSessionId);
        if (existing && existing.status !== 'completed') {
          sessionData = existing;
          const existingResponses = await getSessionResponses(existingSessionId);
          const responseMap: Record<string, any> = {};
          existingResponses.forEach(r => {
            responseMap[r.step_id] = r.response_value;
          });
          setResponses(responseMap);
          setCurrentStepIndex(existing.current_step);
        } else {
          console.log('Creating new session - existing was completed or not found');
          sessionData = await createNewSession(offerData.id, urlParams);
        }
      } else {
        console.log('No existing session, creating new');
        sessionData = await createNewSession(offerData.id, urlParams);
      }

      console.log('Session data:', sessionData);
      setSession(sessionData);
      localStorage.setItem(`offer_session_${offerSlug}`, sessionData.session_id);
      console.log('Offer initialization complete');
    } catch (err: any) {
      console.error('=== OfferRenderer: Error ===');
      console.error('Error loading offer:', err);
      console.error('Error message:', err?.message);
      console.error('Error code:', err?.code);
      console.error('Error details:', err?.details);
      console.error('Error hint:', err?.hint);

      let errorMessage = 'Unable to load this offer.';

      if (err?.message) {
        if (err.message.includes('Failed to fetch offer by slug')) {
          errorMessage = 'This offer could not be found. It may have been deleted or the URL is incorrect.';
        } else if (err.message.includes('Failed to fetch offer steps')) {
          errorMessage = 'Offer found but steps could not be loaded. Please contact support.';
        } else if (err.message.includes('Failed to create offer session')) {
          errorMessage = 'Unable to start offer session. Please try refreshing the page.';
        } else if (err.message.includes('permission') || err.message.includes('policy')) {
          errorMessage = 'You do not have permission to view this offer. Please sign in or contact the offer creator.';
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function createNewSession(offerId: string, urlParams: URLSearchParams): Promise<OfferSession> {
    const trackingData = {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      utm_term: urlParams.get('utm_term') || undefined,
      utm_content: urlParams.get('utm_content') || undefined,
      everflow_click_id: urlParams.get('oid') || urlParams.get('click_id') || undefined,
      referrer: document.referrer || undefined,
      user_agent: navigator.userAgent,
      device_type: getDeviceType(),
    };

    return await createOfferSession(offerId, trackingData);
  }

  function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  async function handleNext() {
    if (!session || !offer) return;

    const currentStep = steps[currentStepIndex];
    const response = responses[currentStep.id];

    if (currentStep.validation_rules.required && !response) {
      alert('This field is required');
      return;
    }

    if (currentStep.step_type === 'email' && response) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(response)) {
        alert('Please enter a valid email address');
        return;
      }
    }

    if (currentStep.step_type === 'phone' && response) {
      const phonePattern = /^\d{10}$/;
      const cleaned = response.replace(/\D/g, '');
      if (!phonePattern.test(cleaned)) {
        alert('Please enter a valid 10-digit phone number');
        return;
      }
    }

    const timeSpent = Math.floor((Date.now() - stepStartTime) / 1000);

    await saveOfferResponse({
      session_id: session.session_id,
      step_id: currentStep.id,
      response_value: response,
      response_text: typeof response === 'string' ? response : JSON.stringify(response),
      time_spent_seconds: timeSpent,
    });

    if (currentStepIndex < steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setStepStartTime(Date.now());

      await updateOfferSession(session.session_id, {
        status: 'in_progress',
        current_step: nextIndex,
      });
    } else {
      await handleSubmit();
    }
  }

  async function handleBack() {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setStepStartTime(Date.now());
    }
  }

  async function handleSubmit() {
    if (!session || !offer) return;

    setSubmitting(true);
    try {
      const leadId = await completeOfferSession(session.session_id, offer.id);
      setCompleted(true);
      localStorage.removeItem(`offer_session_${offerSlug}`);

      if (offer.everflow_offer_id && session.everflow_click_id) {
        fireEverflowPixel(session.everflow_click_id, leadId, offer.default_payout);
      }
    } catch (err) {
      alert('Failed to submit. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function fireEverflowPixel(clickId: string, leadId: string, payout: number) {
    const img = new Image();
    img.src = `https://tracking.example.com/conversion?oid=${clickId}&transaction_id=${leadId}&amount=${payout}`;
  }

  function handleResponseChange(stepId: string, value: any) {
    setResponses({ ...responses, [stepId]: value });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mx-auto mb-4">
            <AlertCircle size={32} className="text-rose-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2 text-center">Unable to Load Offer</h2>
          <p className="text-slate-600 text-center mb-4">{error || 'Offer not found'}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
          <p className="text-slate-600">
            Your information has been submitted successfully. We'll be in touch soon!
          </p>
        </div>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  const primaryColor = offer.config.theme?.primaryColor || '#6366f1';

  return (
    <div className="min-h-screen bg-slate-50">
      {offer.config.progressBar?.style !== 'none' && (
        <div className="fixed top-0 left-0 right-0 bg-white border-b border-slate-200 z-10">
          <div className="h-2 bg-slate-200">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: primaryColor }}
            />
          </div>
          <div className="px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-slate-600">{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{currentStep.question_text}</h2>
            {currentStep.help_text && (
              <p className="text-sm text-slate-600 mb-6">{currentStep.help_text}</p>
            )}

            <div className="mb-8">
              {renderStepInput(currentStep, responses[currentStep.id], (value) =>
                handleResponseChange(currentStep.id, value)
              )}
            </div>

            <div className="flex gap-3">
              {currentStepIndex > 0 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <ChevronLeft size={20} />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={submitting}
                className="flex-1 px-6 py-3 text-white font-medium rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                {submitting ? (
                  'Submitting...'
                ) : currentStepIndex === steps.length - 1 ? (
                  'Submit'
                ) : (
                  <>
                    Continue
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderStepInput(
  step: OfferStep,
  value: any,
  onChange: (value: any) => void
) {
  switch (step.step_type) {
    case 'single_choice':
    case 'yes_no':
      return (
        <div className="space-y-3">
          {step.options.map((option) => (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                value === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <span className="font-medium text-slate-900">{option.label}</span>
            </button>
          ))}
        </div>
      );

    case 'multi_choice':
      return (
        <div className="space-y-3">
          {step.options.map((option) => (
            <label
              key={option.value}
              className="flex items-center p-4 border-2 border-slate-200 rounded-lg hover:border-slate-300 cursor-pointer transition-all"
            >
              <input
                type="checkbox"
                checked={(value || []).includes(option.value)}
                onChange={(e) => {
                  const current = value || [];
                  if (e.target.checked) {
                    onChange([...current, option.value]);
                  } else {
                    onChange(current.filter((v: any) => v !== option.value));
                  }
                }}
                className="mr-3 h-5 w-5"
              />
              <span className="font-medium text-slate-900">{option.label}</span>
            </label>
          ))}
        </div>
      );

    case 'dropdown':
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
        >
          <option value="">Select an option...</option>
          {step.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case 'text_input':
    case 'email':
    case 'phone':
    case 'zip_code':
      return (
        <input
          type={step.step_type === 'email' ? 'email' : step.step_type === 'phone' ? 'tel' : 'text'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={step.placeholder_text}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={step.placeholder_text}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
        />
      );

    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
        />
      );

    case 'address':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={step.placeholder_text || 'Enter your full address'}
          rows={4}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none text-slate-900"
        />
      );

    default:
      return null;
  }
}

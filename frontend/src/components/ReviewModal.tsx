import { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  targetUserName: string;
}

export default function ReviewModal({ isOpen, onClose, onSubmit, targetUserName }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(rating, comment);
      setRating(5);
      setComment("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-3xl bg-white p-8 text-left align-middle shadow-2xl transition-all">
                <button
                  onClick={onClose}
                  className="absolute right-6 top-6 rounded-full bg-neutral-100 p-2 text-neutral-500 hover:bg-neutral-200 hover:text-black transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                
                <Dialog.Title
                  as="h3"
                  className="text-2xl font-extrabold leading-6 text-black tracking-tight"
                >
                  Leave a Review
                </Dialog.Title>
                
                <div className="mt-2 mb-8">
                  <p className="text-sm text-neutral-500">
                    Share your experience with <span className="font-semibold text-black">{targetUserName}</span>. Your feedback helps build trust in our community.
                  </p>
                </div>

                {error && (
                  <div className="mb-6 rounded-lg bg-red-50 p-3 text-[11px] font-bold text-red-600">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Rating Selector */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-700 mb-3 text-center">Tap to Rate</label>
                    <div className="flex justify-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`p-2 rounded-full transition-all duration-200 ${rating >= star ? 'bg-[#F5C518]/10 text-[#F5C518] scale-110' : 'bg-neutral-50 text-neutral-300 hover:bg-neutral-100'}`}
                        >
                          <Star className={`w-8 h-8 ${rating >= star ? 'fill-current' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Box */}
                  <div>
                    <label htmlFor="comment" className="block text-[10px] font-bold uppercase tracking-widest text-neutral-700 mb-2">Comment (Optional)</label>
                    <textarea
                      id="comment"
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full rounded-2xl border border-neutral-200 p-4 text-[13px] text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black resize-none"
                      placeholder="What was it like transacting with them?"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-black py-4 text-[12px] font-bold tracking-wide text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Review"}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

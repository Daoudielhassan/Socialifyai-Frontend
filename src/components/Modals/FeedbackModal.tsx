import React, { Fragment, useState } from 'react';
import { Dialog, Transition, Listbox } from '@headlessui/react';
import { X, Check, ChevronsDownUp as ChevronUpDown } from 'lucide-react';
import { Message } from '../UI/MessageCard';
import { Priority } from '../UI/PriorityTag';
import { Context } from '../UI/ContextTag';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message | null;
  onSubmit: (feedback: {
    messageId: string;
    correctPriority: Priority;
    correctContext: Context;
    comments?: string;
  }) => void;
}

const priorityOptions: { value: Priority; label: string }[] = [
  { value: 'very_urgent', label: 'Very Urgent' },
  { value: 'important', label: 'Important' },
  { value: 'not_important', label: 'Not Important' },
];

const contextOptions: { value: Context; label: string }[] = [
  { value: 'business', label: 'Business' },
  { value: 'personal', label: 'Personal' },
];

export default function FeedbackModal({ isOpen, onClose, message, onSubmit }: FeedbackModalProps) {
  const [selectedPriority, setSelectedPriority] = useState<Priority>(message?.priority || 'not_important');
  const [selectedContext, setSelectedContext] = useState<Context>(message?.context || 'personal');
  const [comments, setComments] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    onSubmit({
      messageId: message.id,
      correctPriority: selectedPriority,
      correctContext: selectedContext,
      comments: comments.trim() || undefined,
    });

    // Reset form
    setComments('');
    onClose();
  };

  if (!message) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Correct AI Prediction
                    </Dialog.Title>
                    
                    <div className="mt-4">
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-gray-900 mb-2">Message from {message.sender}</h4>
                        <p className="text-sm text-gray-600 mb-2">{message.subject}</p>
                        <p className="text-sm text-gray-500">{message.preview}</p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Priority Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correct Priority
                          </label>
                          <Listbox value={selectedPriority} onChange={setSelectedPriority}>
                            <div className="relative">
                              <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm">
                                <span className="block truncate">
                                  {priorityOptions.find(p => p.value === selectedPriority)?.label}
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                  <ChevronUpDown className="h-5 w-5 text-gray-400" />
                                </span>
                              </Listbox.Button>
                              <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  {priorityOptions.map((option) => (
                                    <Listbox.Option
                                      key={option.value}
                                      className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                          active ? 'bg-blue-600 text-white' : 'text-gray-900'
                                        }`
                                      }
                                      value={option.value}
                                    >
                                      {({ selected, active }) => (
                                        <>
                                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                            {option.label}
                                          </span>
                                          {selected ? (
                                            <span
                                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                active ? 'text-white' : 'text-blue-600'
                                              }`}
                                            >
                                              <Check className="h-5 w-5" />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>
                        </div>

                        {/* Context Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Correct Context
                          </label>
                          <Listbox value={selectedContext} onChange={setSelectedContext}>
                            <div className="relative">
                              <Listbox.Button className="relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm">
                                <span className="block truncate">
                                  {contextOptions.find(c => c.value === selectedContext)?.label}
                                </span>
                                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                  <ChevronUpDown className="h-5 w-5 text-gray-400" />
                                </span>
                              </Listbox.Button>
                              <Transition
                                as={Fragment}
                                leave="transition ease-in duration-100"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                              >
                                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                  {contextOptions.map((option) => (
                                    <Listbox.Option
                                      key={option.value}
                                      className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                          active ? 'bg-blue-600 text-white' : 'text-gray-900'
                                        }`
                                      }
                                      value={option.value}
                                    >
                                      {({ selected, active }) => (
                                        <>
                                          <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                            {option.label}
                                          </span>
                                          {selected ? (
                                            <span
                                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                                active ? 'text-white' : 'text-blue-600'
                                              }`}
                                            >
                                              <Check className="h-5 w-5" />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </Transition>
                            </div>
                          </Listbox>
                        </div>

                        {/* Comments */}
                        <div>
                          <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Comments (Optional)
                          </label>
                          <textarea
                            id="comments"
                            rows={3}
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                            placeholder="Any additional feedback about this prediction..."
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                          />
                        </div>

                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                            onClick={onClose}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                          >
                            Submit Feedback
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
import React, { useState, useRef } from 'react';
import { Plant, GardenBed, SowingMethod } from '../types/garden';
import { X, Calendar, Plus, Check, Mic, MicOff, Loader2 } from 'lucide-react';

interface AddToBedModalProps {
  plant: Plant | null;
  defaultMethod?: SowingMethod;
  beds: GardenBed[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmAdd: (
    bedId: string,
    plant: Plant,
    sownDate: string,
    expectedHarvestDate: string,
    method: SowingMethod,
    notes: string
  ) => void;
  onCreateNewBed: (name: string) => string; // returns created bed id
}

export const AddToBedModal: React.FC<AddToBedModalProps> = ({
  plant,
  defaultMethod = 'direct',
  beds,
  isOpen,
  onClose,
  onConfirmAdd,
  onCreateNewBed
}) => {
  if (!isOpen || !plant) return null;

  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedBedId, setSelectedBedId] = useState<string>(
    beds.length > 0 ? beds[0].id : 'new'
  );
  const [newBedName, setNewBedName] = useState('');
  const [sownDate, setSownDate] = useState(todayStr);
  const [method, setMethod] = useState<SowingMethod>(defaultMethod);
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleToggleRecordNote = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          if (blob.size === 0) return;

          setIsTranscribing(true);
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64data = (reader.result as string).split(',')[1];
            try {
              const res = await fetch('/api/gemini/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audioBase64: base64data, mimeType: 'audio/webm' })
              });
              const data = await res.json();
              if (data.transcript) {
                setNotes((prev) => (prev ? `${prev} ${data.transcript}` : data.transcript));
              }
            } catch (err) {
              console.error('Transcription error', err);
            } finally {
              setIsTranscribing(false);
            }
          };
        };

        recorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Mic access error', err);
      }
    }
  };

  // Calculate expected harvest date based on plant.daysToMaturity
  const calculateHarvestDate = (sown: string, days: number): string => {
    const d = new Date(sown);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const expectedHarvest = calculateHarvestDate(sownDate, plant.daysToMaturity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let targetBedId = selectedBedId;

    if (selectedBedId === 'new') {
      if (!newBedName.trim()) return;
      targetBedId = onCreateNewBed(newBedName.trim());
    }

    onConfirmAdd(
      targetBedId,
      plant,
      sownDate,
      expectedHarvest,
      method,
      notes.trim()
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-800 w-full max-w-md flex flex-col overflow-hidden text-stone-900 dark:text-stone-100">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/60">
          <div>
            <h3 className="font-serif font-bold text-stone-900 dark:text-stone-100 text-base">
              Add {plant.name} to Garden Bed
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Log this sowing and track estimated harvest dates.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-300">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Target Bed */}
          <div>
            <label className="font-medium text-stone-700 dark:text-stone-300 block mb-1">
              Select Destination Bed
            </label>
            <select
              value={selectedBedId}
              onChange={(e) => setSelectedBedId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-600"
            >
              {beds.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.type})
                </option>
              ))}
              <option value="new">+ Create New Bed...</option>
            </select>
          </div>

          {selectedBedId === 'new' && (
            <div>
              <label className="font-medium text-stone-700 dark:text-stone-300 block mb-1">
                New Bed Name
              </label>
              <input
                type="text"
                value={newBedName}
                onChange={(e) => setNewBedName(e.target.value)}
                placeholder="e.g. Raised Bed #2 (Kitchen Garden)"
                className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 rounded-lg focus:outline-hidden focus:border-emerald-600"
                required
              />
            </div>
          )}

          {/* Sowing Method */}
          <div>
            <label className="font-medium text-stone-700 dark:text-stone-300 block mb-1">
              Sowing Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as SowingMethod)}
              className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-600"
            >
              <option value="direct">Direct Sow Outdoors</option>
              <option value="indoor">Start Indoors Under Lights</option>
              <option value="transplant">Transplant Starts Outdoors</option>
              <option value="overwinter">Overwintering / Fall Planted</option>
            </select>
          </div>

          {/* Sown Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-medium text-stone-700 dark:text-stone-300 block mb-1">
                Date Sown / Planted
              </label>
              <input
                type="date"
                value={sownDate}
                onChange={(e) => setSownDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg font-mono text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-emerald-600"
                required
              />
            </div>

            <div>
              <label className="font-medium text-stone-700 dark:text-stone-300 block mb-1">
                Estimated Harvest
              </label>
              <div className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-lg font-mono text-xs text-stone-800 dark:text-stone-200">
                {expectedHarvest} ({plant.daysToMaturity}d)
              </div>
            </div>
          </div>

          {/* Custom Notes with Mic Dictation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-stone-700 dark:text-stone-300 block">
                Variety or Notes (Optional)
              </label>
              <button
                type="button"
                onClick={handleToggleRecordNote}
                className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center gap-1"
                title="Dictate note with microphone (gemini-3.5-transcribe)"
              >
                {isRecording ? (
                  <span className="text-rose-600 dark:text-rose-400 animate-pulse flex items-center gap-1 font-medium">
                    <MicOff className="w-3 h-3" /> Stop recording
                  </span>
                ) : isTranscribing ? (
                  <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Transcribing...
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Mic className="w-3 h-3" /> Voice Dictate
                  </span>
                )}
              </button>
            </div>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Music Garlic, heirloom variety, seed batch 2026"
              className="w-full px-3 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 rounded-lg focus:outline-hidden focus:border-emerald-600"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex justify-end gap-2 border-t border-stone-100 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-colors shadow-xs"
            >
              Confirm Planting
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};


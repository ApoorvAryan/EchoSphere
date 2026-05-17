import { useState } from 'react';
import { motion } from 'framer-motion';
import { RiUploadCloud2Line, RiMusicLine, RiImageLine } from 'react-icons/ri';
import { uploadSong } from '../services/api';
import toast from 'react-hot-toast';

export default function Upload() {
  const [form, setForm] = useState({ title: '', artist: '', album: '', genre: '', duration: '' });
  const [audioFile, setAudioFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) return toast.error('Please select an audio file');
    if (!form.title || !form.artist) return toast.error('Title and artist are required');

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v) formData.append(k, v); });
    formData.append('audio', audioFile);
    if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

    setLoading(true);
    setProgress(0);
    try {
      await uploadSong(formData);
      toast.success('Song uploaded successfully! 🎵');
      setForm({ title: '', artist: '', album: '', genre: '', duration: '' });
      setAudioFile(null);
      setThumbnailFile(null);
      setThumbnailPreview('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="px-8 py-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-8">
          <RiUploadCloud2Line className="text-echo-accent text-3xl" />
          <h1 className="font-display text-3xl font-bold">Upload Song</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Audio file */}
          <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${audioFile ? 'border-echo-accent bg-echo-accent-glow' : 'border-echo-border hover:border-echo-accent'}`}>
            <input type="file" id="audio" accept="audio/*" className="hidden" onChange={(e) => setAudioFile(e.target.files[0])} />
            <label htmlFor="audio" className="cursor-pointer flex flex-col items-center gap-3">
              <RiMusicLine className={`text-4xl ${audioFile ? 'text-echo-accent' : 'text-echo-muted'}`} />
              {audioFile ? (
                <p className="text-echo-accent font-medium">{audioFile.name}</p>
              ) : (
                <>
                  <p className="text-echo-text font-medium">Drop audio file here</p>
                  <p className="text-echo-muted text-sm">MP3, WAV, OGG supported</p>
                </>
              )}
            </label>
          </div>

          {/* Thumbnail */}
          <div className="flex gap-4 items-start">
            <div className={`border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer w-32 h-32 shrink-0 ${thumbnailPreview ? 'border-echo-accent' : 'border-echo-border hover:border-echo-accent'}`}>
              <input type="file" id="thumbnail" accept="image/*" className="hidden" onChange={handleThumbnail} />
              <label htmlFor="thumbnail" className="cursor-pointer flex flex-col items-center justify-center h-full gap-2">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Cover" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <>
                    <RiImageLine className="text-2xl text-echo-muted" />
                    <p className="text-xs text-echo-muted">Cover art</p>
                  </>
                )}
              </label>
            </div>
            <div className="flex-1 space-y-3">
              <input type="text" placeholder="Song title *" className="input-field"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <input type="text" placeholder="Artist name *" className="input-field"
                value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="text" placeholder="Album (optional)" className="input-field"
              value={form.album} onChange={(e) => setForm({ ...form, album: e.target.value })} />
            <input type="text" placeholder="Genre (optional)" className="input-field"
              value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <><RiUploadCloud2Line /> Upload to EchoSphere</>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

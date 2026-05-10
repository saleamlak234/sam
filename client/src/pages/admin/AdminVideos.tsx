import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Upload,
    Play,
    Edit,
    Trash2,
    Eye,
    Video,
    FileVideo,
    AlertCircle,
    CheckCircle,
    X
} from 'lucide-react';

interface Video {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    rewardAmount: number;
    isActive: boolean;
    totalViews: number;
    dailyViews: number;
    uploadedBy: {
        _id: string;
        fullName: string;
        email: string;
    };
    createdAt: string;
}

const AdminVideos: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);
    const [error, setError] = useState('');

    // Form states
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        rewardAmount: '20',
        video: null as File | null
    });

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await axios.get('/videos');
            setVideos(response.data.videos);
        } catch (error) {
            console.error('Error fetching videos:', error);
            setError('Failed to fetch videos');
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, video: file }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        setError('');

        try {
            const submitData = new FormData();
            submitData.append('title', formData.title);
            submitData.append('description', formData.description);
            submitData.append('duration', formData.duration);
            submitData.append('rewardAmount', formData.rewardAmount);
            if (formData.video) {
                submitData.append('video', formData.video);
            }

            if (editingVideo) {
                // Update existing video
                await axios.put(`/videos/${editingVideo._id}`, {
                    title: formData.title,
                    description: formData.description,
                    rewardAmount: parseInt(formData.rewardAmount),
                    isActive: editingVideo.isActive
                });
            } else {
                // Upload new video
                await axios.post('/videos', submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            }

            // Reset form
            setFormData({
                title: '',
                description: '',
                duration: '',
                rewardAmount: '20',
                video: null
            });
            setShowUploadForm(false);
            setEditingVideo(null);
            fetchVideos();
        } catch (error: any) {
            console.error('Error saving video:', error);
            setError(error.response?.data?.message || 'Failed to save video');
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (video: Video) => {
        setEditingVideo(video);
        setFormData({
            title: video.title,
            description: video.description,
            duration: video.duration.toString(),
            rewardAmount: video.rewardAmount.toString(),
            video: null
        });
        setShowUploadForm(true);
    };

    const handleDelete = async (videoId: string) => {
        if (!confirm('Are you sure you want to delete this video?')) return;

        try {
            await axios.delete(`/videos/${videoId}`);
            fetchVideos();
        } catch (error) {
            console.error('Error deleting video:', error);
            setError('Failed to delete video');
        }
    };

    const toggleVideoStatus = async (video: Video) => {
        try {
            await axios.put(`/videos/${video._id}`, {
                title: video.title,
                description: video.description,
                isActive: !video.isActive,
                rewardAmount: video.rewardAmount
            });
            fetchVideos();
        } catch (error) {
            console.error('Error updating video status:', error);
            setError('Failed to update video status');
        }
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-gray-50">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Video Management</h1>
                        <p className="mt-2 text-gray-600">Upload and manage advertisement videos</p>
                    </div>
                    <button
                        onClick={() => {
                            setShowUploadForm(true);
                            setEditingVideo(null);
                            setFormData({
                                title: '',
                                description: '',
                                duration: '',
                                rewardAmount: '20',
                                video: null
                            });
                        }}
                        className="flex items-center px-4 py-2 space-x-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Upload className="w-5 h-5" />
                        <span>Upload Video</span>
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="flex items-center p-4 mb-6 space-x-2 text-red-700 bg-red-100 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                        <button
                            onClick={() => setError('')}
                            className="ml-auto text-red-700 hover:text-red-900"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Upload/Edit Form */}
                {showUploadForm && (
                    <div className="p-6 mb-8 bg-white rounded-lg shadow-md">
                        <h2 className="mb-4 text-xl font-semibold">
                            {editingVideo ? 'Edit Video' : 'Upload New Video'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Duration (seconds) *
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-700">
                                        Reward Amount (ETB)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.rewardAmount}
                                        onChange={(e) => setFormData(prev => ({ ...prev, rewardAmount: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        min="0"
                                    />
                                </div>
                                {!editingVideo && (
                                    <div>
                                        <label className="block mb-2 text-sm font-medium text-gray-700">
                                            Video File *
                                        </label>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={handleFileChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required={!editingVideo}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowUploadForm(false);
                                        setEditingVideo(null);
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {uploading ? 'Saving...' : (editingVideo ? 'Update' : 'Upload')}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Videos List */}
                <div className="bg-white rounded-lg shadow-md">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold">Videos ({videos.length})</h2>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {videos.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No videos uploaded yet
                            </div>
                        ) : (
                            videos.map((video) => (
                                <div key={video._id} className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3">
                                                <Video className="w-8 h-8 text-blue-600" />
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {video.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {video.description}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center mt-3 space-x-6 text-sm text-gray-500">
                                                <span>Duration: {formatDuration(video.duration)}</span>
                                                <span>Reward: {video.rewardAmount} ETB</span>
                                                <span>Total Views: {video.totalViews}</span>
                                                <span>Daily Views: {video.dailyViews}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs ${video.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {video.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => toggleVideoStatus(video)}
                                                className={`p-2 rounded-md ${video.isActive
                                                        ? 'text-red-600 hover:bg-red-50'
                                                        : 'text-green-600 hover:bg-green-50'
                                                    }`}
                                                title={video.isActive ? 'Deactivate' : 'Activate'}
                                            >
                                                {video.isActive ? <Eye className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(video)}
                                                className="p-2 text-blue-600 rounded-md hover:bg-blue-50"
                                                title="Edit"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(video._id)}
                                                className="p-2 text-red-600 rounded-md hover:bg-red-50"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminVideos;
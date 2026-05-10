import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoPlayer from '../components/VideoPlayer';
import LoadingSpinner from '../components/LoadingSpinner';
import { Play, Clock, DollarSign, CheckCircle } from 'lucide-react';

interface Video {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
    rewardAmount: number;
    totalViews: number;
}

interface WatchHistory {
    _id: string;
    video: Video;
    watchedAt: string;
    rewardGiven: boolean;
}

const Videos: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [watchHistory, setWatchHistory] = useState<WatchHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
    const [todayRewards, setTodayRewards] = useState(0);

    useEffect(() => {
        fetchVideos();
        fetchWatchHistory();
        fetchTodayRewards();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await axios.get('/videos/active');
            setVideos(response.data.videos);
        } catch (error) {
            console.error('Error fetching videos:', error);
        }
    };

    const fetchWatchHistory = async () => {
        try {
            const response = await axios.get('/videos/history');
            setWatchHistory(response.data.watches);
        } catch (error) {
            console.error('Error fetching watch history:', error);
        }
    };

    const fetchTodayRewards = async () => {
        try {
            const response = await axios.get('/videos/rewards/today');
            setTodayRewards(response.data.todayRewards || 0);
        } catch (error) {
            console.error('Error fetching today rewards:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleWatchComplete = () => {
        // Refresh data after completing a video
        fetchWatchHistory();
        fetchTodayRewards();
        setSelectedVideo(null);
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const hasWatchedToday = (videoId: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return watchHistory.some(watch =>
            watch?.video?._id === videoId &&
            watch.watchedAt &&
            new Date(watch.watchedAt) >= today &&
            watch.rewardGiven
        );
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Watch & Earn</h1>
                    <p className="mt-2 text-gray-600">
                        Watch promotional videos and earn rewards. Each video can be watched once per day for rewards.
                    </p>
                </div>

                {/* Today's Rewards Summary */}
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
                    <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                        <div className="flex items-center">
                            <DollarSign className="w-8 h-8 text-green-600" />
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Today's Earnings</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {todayRewards.toLocaleString()} ETB
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                        <div className="flex items-center">
                            <Play className="w-8 h-8 text-blue-600" />
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Videos Watched Today</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {watchHistory.filter(watch => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return new Date(watch.watchedAt) >= today && watch.rewardGiven;
                                    }).length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                        <div className="flex items-center">
                            <CheckCircle className="w-8 h-8 text-purple-600" />
                            <div className="ml-4">
                                <p className="text-sm text-gray-600">Available Videos</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {videos.length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Player Modal */}
                {selectedVideo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
                        <div className="relative w-full max-w-4xl p-4 mx-4 bg-white rounded-lg">
                            <button
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                            >
                                ✕
                            </button>
                            <VideoPlayer
                                video={selectedVideo}
                                onWatchComplete={handleWatchComplete}
                            />
                        </div>
                    </div>
                )}

                {/* Videos Grid */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {videos.map((video) => {
                        const watched = hasWatchedToday(video._id);
                        return (
                            <div
                                key={video._id}
                                className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md transition-shadow"
                            >
                                {/* Video Thumbnail/Preview */}
                                <div className="relative bg-gray-900 aspect-video overflow-hidden">
                                    {video.thumbnailUrl ? (
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-gray-900" />
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <button
                                            onClick={() => setSelectedVideo(video)}
                                            className="flex items-center justify-center w-16 h-16 text-white transition-colors bg-black bg-opacity-75 rounded-full hover:bg-opacity-100"
                                            disabled={watched}
                                        >
                                            <Play className="w-8 h-8 ml-1" />
                                        </button>
                                    </div>

                                    {/* Duration */}
                                    <div className="absolute bottom-2 right-2 px-2 py-1 text-xs text-white bg-black bg-opacity-75 rounded">
                                        <Clock className="inline w-3 h-3 mr-1" />
                                        {formatDuration(video.duration)}
                                    </div>

                                    {/* Watched Badge */}
                                    {watched && (
                                        <div className="absolute top-2 right-2 px-2 py-1 text-xs text-white bg-green-600 rounded">
                                            <CheckCircle className="inline w-3 h-3 mr-1" />
                                            Watched
                                        </div>
                                    )}
                                </div>

                                {/* Video Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900">{video.title}</h3>
                                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                                        {video.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center text-sm text-green-600">
                                            <DollarSign className="w-4 h-4 mr-1" />
                                            +{video.rewardAmount} ETB
                                        </div>

                                        <div className="flex items-center text-sm text-gray-500">
                                            <Play className="w-4 h-4 mr-1" />
                                            {video.totalViews} views
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedVideo(video)}
                                        className={`w-full mt-4 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${watched
                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                            : 'bg-primary-600 text-white hover:bg-primary-700'
                                            }`}
                                        disabled={watched}
                                    >
                                        {watched ? 'Already Watched Today' : 'Watch & Earn'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {videos.length === 0 && (
                    <div className="py-12 text-center">
                        <Play className="w-16 h-16 mx-auto text-gray-400" />
                        <h3 className="mt-4 text-lg font-medium text-gray-900">No videos available</h3>
                        <p className="mt-2 text-gray-600">Check back later for new promotional videos.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Videos;
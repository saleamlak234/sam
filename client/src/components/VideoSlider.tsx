import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';

interface Video {
    _id: string;
    title: string;
    description: string;
    streamUrl: string;
    thumbnailUrl?: string;
    duration: number;
    rewardAmount: number;
}

const VideoSlider: React.FC = () => {
    const [videos, setVideos] = useState<Video[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await axios.get('/api/videos/active');
            setVideos(response.data.videos);
        } catch (error) {
            console.error('Error fetching videos:', error);
        } finally {
            setLoading(false);
        }
    };

    const nextVideo = () => {
        setCurrentIndex((prev) => (prev + 1) % videos.length);
    };

    const prevVideo = () => {
        setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
    };

    const handleWatchComplete = () => {
        // Auto advance to next video after completion
        setTimeout(() => {
            nextVideo();
        }, 2000);
    };

    if (loading) {
        return (
            <div className="w-full h-96 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                <div className="text-gray-500">Loading videos...</div>
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-gray-500">No videos available</div>
            </div>
        );
    }

    return (
        <div className="relative w-full max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-lg">
                <VideoPlayer
                    video={videos[currentIndex]}
                    onWatchComplete={handleWatchComplete}
                />

                {/* Navigation buttons */}
                {videos.length > 1 && (
                    <>
                        <button
                            onClick={prevVideo}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                        >
                            ‹
                        </button>
                        <button
                            onClick={nextVideo}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                        >
                            ›
                        </button>
                    </>
                )}
            </div>

            {/* Video indicators */}
            {videos.length > 1 && (
                <div className="flex justify-center space-x-2 mt-4">
                    {videos.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-3 h-3 rounded-full transition-all ${index === currentIndex ? 'bg-primary-600' : 'bg-gray-300'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default VideoSlider;
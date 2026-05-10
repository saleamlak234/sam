import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

interface Video {
    _id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration: number;
    rewardAmount: number;
}

interface VideoPlayerProps {
    video: Video;
    onWatchComplete?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onWatchComplete }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [watchId, setWatchId] = useState<string | null>(null);
    const [hasWatchedToday, setHasWatchedToday] = useState(false);

    useEffect(() => {
        // Start watch tracking when component mounts
        startWatchTracking();
    }, [video._id]);

    const startWatchTracking = async () => {
        try {
            const response = await axios.post(`/videos/${video._id}/watch`);
            if (response.data.watch) {
                setWatchId(response.data.watch._id);
                if (response.data.message === "Already watched today") {
                    setHasWatchedToday(true);
                }
            }
        } catch (error) {
            console.error('Error starting watch tracking:', error);
        }
    };

    const handleTimeUpdate = async () => {
        if (!videoRef.current || !watchId || hasWatchedToday) return;

        const currentTime = videoRef.current.currentTime;
        setCurrentTime(currentTime);

        try {
            await axios.put(`/videos/${video._id}/watch/${watchId}`, {
                watchDuration: Math.floor(currentTime),
                completed: currentTime >= video.duration * 0.9, // 90% watched
            });
        } catch (error) {
            console.error('Error updating watch progress:', error);
        }
    };

    const handleEnded = async () => {
        if (!watchId || hasWatchedToday) return;

        try {
            await axios.put(`/videos/${video._id}/watch/${watchId}`, {
                watchDuration: video.duration,
                completed: true,
            });

            setHasWatchedToday(true);
            if (onWatchComplete) {
                onWatchComplete();
            }
        } catch (error) {
            console.error('Error completing watch:', error);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative bg-black rounded-lg overflow-hidden">
            <video
                ref={videoRef}
                src={video.videoUrl}
                poster={video.thumbnailUrl}
                preload="metadata"
                className="w-full h-auto"
                controls={!hasWatchedToday}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <div className="text-white">
                    <h3 className="font-semibold text-lg">{video.title}</h3>
                    <p className="text-sm opacity-90">{video.description}</p>

                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-4 text-sm">
                            <span>{formatTime(currentTime)} / {formatTime(video.duration)}</span>
                            <span>Reward: {video.rewardAmount} ETB</span>
                        </div>

                        {hasWatchedToday && (
                            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                                ✓ Watched Today
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
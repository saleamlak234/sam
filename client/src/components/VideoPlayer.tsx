import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';

interface Video {
    _id: string;
    title: string;
    description: string;
    streamUrl: string;
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
    const [bufferedTime, setBufferedTime] = useState(0);
    const [watchId, setWatchId] = useState<string | null>(null);
    const [hasWatchedToday, setHasWatchedToday] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        startWatchTracking();
    }, [video._id]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleProgress = () => {
            if (video.buffered.length > 0) {
                setBufferedTime(video.buffered.end(video.buffered.length - 1));
            }
        };

        video.addEventListener('progress', handleProgress);
        return () => video.removeEventListener('progress', handleProgress);
    }, []);

    const startWatchTracking = async () => {
        try {
            const response = await axios.post(`/api/videos/${video._id}/watch`);
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

        const time = videoRef.current.currentTime;
        setCurrentTime(time);

        try {
            await axios.put(`/api/videos/${video._id}/watch/${watchId}`, {
                watchDuration: Math.floor(time),
                completed: time >= video.duration * 0.9,
            });
        } catch (error) {
            console.error('Error updating watch progress:', error);
        }
    };

    const handleEnded = async () => {
        if (!watchId || hasWatchedToday) return;

        try {
            await axios.put(`/api/videos/${video._id}/watch/${watchId}`, {
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

    const handleSeek = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progressPercent = (currentTime / video.duration) * 100;
    const bufferedPercent = (bufferedTime / video.duration) * 100;

    return (
        <div
            className="relative bg-black rounded-lg overflow-hidden group"
            onMouseMove={handleMouseMove}
        >
            <video
                ref={videoRef}
                src={video.streamUrl}
                poster={video.thumbnailUrl}
                preload="metadata"
                className="w-full h-auto"
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {/* Custom Controls Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                {/* Title and Info */}
                <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
                    <h3 className="font-semibold text-lg text-white">{video.title}</h3>
                    {video.description && <p className="text-sm text-gray-200 opacity-90">{video.description}</p>}
                </div>

                {/* Progress Bar */}
                <div className="absolute bottom-16 left-0 right-0 px-4">
                    <div className="relative h-1 bg-gray-600 rounded-full group/progress cursor-pointer hover:h-2 transition-all"
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const percent = (e.clientX - rect.left) / rect.width;
                            handleSeek(percent * video.duration);
                        }}>
                        {/* Buffered portion */}
                        <div
                            className="absolute h-full bg-gray-400 rounded-full"
                            style={{ width: `${bufferedPercent}%` }}
                        />
                        {/* Played portion */}
                        <div
                            className="absolute h-full bg-red-500 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                        />
                        {/* Seek handle */}
                        <div
                            className="absolute w-3 h-3 bg-red-500 rounded-full top-1/2 transform -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity"
                            style={{ left: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-white">
                            <button
                                onClick={() => {
                                    if (videoRef.current) {
                                        videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
                                    }
                                }}
                                className="hover:text-gray-300 transition"
                            >
                                {isPlaying ? '⏸' : '▶'}
                            </button>
                            <span>{formatTime(currentTime)} / {formatTime(video.duration)}</span>
                            <span>Reward: {video.rewardAmount} ETB</span>
                        </div>

                        {hasWatchedToday && (
                            <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                                ✓ Watched
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
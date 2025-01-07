"use client";
import React, { useEffect, useRef, useState } from "react";

export interface Tag {
    src: string;
    size?: number;
    angle?: number;
    phi?: number;
    theta?: number;
    x?: number;
    y?: number;
    z?: number;
    speed?: number;
    img?: HTMLImageElement;
}

interface TagCloudProps {
    tags: Tag[];
    height: number;
    width: number;
}

const TagCloudCanvas: React.FC<TagCloudProps> = ({ tags, height, width }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [initializedTags, setInitializedTags] = useState<Tag[]>([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        const distributeOnSphere = (index: number, total: number) => {
            const phi = Math.acos(-1 + (2 * index) / total);
            const theta = Math.PI * (1 + Math.sqrt(5)) * index;
            return {
                phi,
                theta,
                x: Math.cos(theta) * Math.sin(phi),
                y: Math.sin(theta) * Math.sin(phi),
                z: Math.cos(phi),
            };
        };

        const loadImages = async () => {
            try {
                const loadedTags = await Promise.all(
                    tags.map(async (tag, index) => {
                        const img = new Image();
                        img.src = tag.src;
                        await new Promise((resolve, reject) => {
                            img.onload = resolve;
                            img.onerror = reject;
                        });
                        const position = distributeOnSphere(index, tags.length);
                        return {
                            ...tag,
                            img,
                            ...position,
                            size: Math.min(tag.size ?? 40, Math.min(width, height) * 0.15),
                            speed: 1,
                        };
                    })
                );
                setInitializedTags(loadedTags);
                setImagesLoaded(true);
            } catch (error) {
                console.error("Error loading images:", error);
            }
        };

        loadImages();
    }, [tags, width, height]);

    useEffect(() => {
        if (!imagesLoaded) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const radius = Math.min(width, height) * 0.3;
        let rotationX = 0;
        let rotationY = 0;
        let targetRotationX = 0;
        let targetRotationY = 0;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left - width / 2) / (width / 2);
            const mouseY = (e.clientY - rect.top - height / 2) / (height / 2);
            targetRotationX = mouseY * Math.PI * 0.5;
            targetRotationY = mouseX * Math.PI * 0.5;
        };

        canvas.addEventListener("mousemove", handleMouseMove);

        const drawTag = (
            ctx: CanvasRenderingContext2D,
            tag: Tag,
            x: number,
            y: number,
            size: number,
            opacity: number
        ) => {
            if (!tag.img) return;
            ctx.save();
            ctx.translate(x, y);
            ctx.globalAlpha = opacity;
            const drawSize = size;
            ctx.drawImage(tag.img, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
            ctx.restore();
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.save();
            ctx.translate(width / 2, height / 2);

            rotationX += (targetRotationX - rotationX) * 0.1;
            rotationY += (targetRotationY - rotationY) * 0.1;

            const positions = initializedTags
                .map(tag => {
                    const phi = tag.phi ?? 0;
                    const theta = (tag.theta ?? 0) + 0.02;
                    const sinRotX = Math.sin(rotationX);
                    const cosRotX = Math.cos(rotationX);
                    const sinRotY = Math.sin(rotationY);
                    const cosRotY = Math.cos(rotationY);

                    const x = Math.cos(theta) * Math.sin(phi);
                    const y = Math.sin(theta) * Math.sin(phi);
                    const z = Math.cos(phi);

                    const x2 = x * cosRotY - z * sinRotY;
                    const z2 = x * sinRotY + z * cosRotY;
                    const y2 = y * cosRotX - z2 * sinRotX;
                    const z3 = y * sinRotX + z2 * cosRotX;

                    const scale = 0.6 + (radius / (radius + z3 * radius)) * 0.4;
                    const screenX = x2 * radius * scale;
                    const screenY = y2 * radius * scale;

                    return {
                        tag,
                        x: screenX,
                        y: screenY,
                        z: z3,
                        scale,
                    };
                })
                .sort((a, b) => b.z - a.z);

            positions.forEach(({ tag, x, y, scale }) => {
                const baseSize = tag.size ?? 40;
                const size = baseSize * (0.8 + scale * 0.2);
                const opacity = Math.max(0.2, Math.min(1, scale));
                drawTag(ctx, tag, x, y, size, opacity);
            });

            ctx.restore();
            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            canvas.removeEventListener("mousemove", handleMouseMove);
        };
    }, [initializedTags, imagesLoaded, height, width]);

    return (
        <div className="relative flex items-center justify-center">
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className="bg-transparent shadow-lg rounded-full"
            />
        </div>
    );
};

export default TagCloudCanvas;

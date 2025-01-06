"use client";
import React from "react";
import { TagCloudCanvas,Tag } from "react-3d-tag-sphere";


interface SkillsGlobeCanvasProps {

    tags: Tag[];

}

const SkillsGlobeCanvas: React.FC<SkillsGlobeCanvasProps> = ({ tags }) => {
    return (
        <section className="h-screen mt-5 w-full max-w-2xl">
            <TagCloudCanvas tags={tags} height={300} width={300}/>
        </section>
    );

}

export default SkillsGlobeCanvas;
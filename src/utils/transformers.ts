import { Skills } from "@/utils/types";
import { Tag } from "react-3d-tag-sphere";

export const convertSkillsToTags = (skills: Skills): Tag[] => {
    // Combine all skills into a single array
    const allSkills = [
        ...skills.languages,
        ...skills.frameworks,
        ...skills.tools
    ];

    // Filter out skills without icons and map to Tag format
    return allSkills
        .filter(skill => skill.icon?.url)
        .map((skill) => ({
            src: skill.icon!.url,
            size: 40, // You can adjust this value
            phi: Math.random() * 360, // Random angle for initial position
            theta: Math.random() * 360, // Random angle for initial position
        }));
};
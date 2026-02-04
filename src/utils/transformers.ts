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
        .map((skill, index) => ({
            src: skill.icon!.url,
            size: 40, // You can adjust this value
            phi: (index * 47) % 360, // Deterministic angle for initial position
            theta: (index * 31) % 360, // Deterministic angle for initial position
        }));
};
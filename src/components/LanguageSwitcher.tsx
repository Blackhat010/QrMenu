// src/components/LanguageSwitcher.tsx
import { useState } from "react";

import { Button, Group } from "@mantine/core";

const LanguageSwitcher = ({ onLanguageChange }: { onLanguageChange: (lang: string) => void }) => {
    const [language, setLanguage] = useState("en");

    const handleLanguageChange = (lang: string) => {
        setLanguage(lang);
        onLanguageChange(lang);
    };

    return (
        <Group>
            <Button onClick={() => handleLanguageChange("en")} variant={language === "en" ? "filled" : "outline"}>
                English
            </Button>
            <Button onClick={() => handleLanguageChange("ar")} variant={language === "ar" ? "filled" : "outline"}>
                Arabic
            </Button>
        </Group>
    );
};

export default LanguageSwitcher;

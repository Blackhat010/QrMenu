import type { FC } from "react";
import { useMemo, useState } from "react";
import { Box, createStyles, Paper, Stack, Text, Flex } from "@mantine/core";
import type { Image, MenuItem } from "@prisma/client";
import { ViewMenuItemModal } from "./ViewMenuItemModal";
import { ImageKitImage } from "../ImageKitImage";

export interface StyleProps {
    imageColor?: string;
}

const useStyles = createStyles((theme, { imageColor }: StyleProps, getRef) => {
    const image = getRef("image");

    const bgColor = useMemo(() => {
        if (imageColor) {
            if (theme.colorScheme === "light") {
                return theme.fn.lighten(imageColor, 0.95);
            }
            return theme.fn.darken(imageColor, 0.95);
        }
        return theme.colors.dark[0];
    }, [imageColor, theme.colorScheme]);

    return {
        cardDescWrap: { flex: 1, gap: 0, overflow: "hidden", padding: theme.spacing.lg },
        cardItem: {
            backgroundColor: bgColor,
            borderRadius: theme.radius.md,
            boxShadow: theme.shadows.sm,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
            transition: "box-shadow 150ms ease, transform 150ms ease",
            "&:hover": {
                boxShadow: theme.shadows.md,
                transform: "scale(1.02)",
            },
        },
        cardImageWrap: {
            position: "relative",
            width: 150,
            height: 150,
            overflow: "hidden",
            borderRadius: theme.radius.md,
        },
        cardImage: {
            height: "100%",
            objectFit: "cover",
            width: "100%",
        },
        cardText: {
            WebkitBoxOrient: "vertical",
            color: theme.black,
            display: "-webkit-box",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
        },
        cardItemTitle: { WebkitLineClamp: 1 },
        cardItemDesc: { WebkitLineClamp: 3 },
    };
});

interface Props {
    /** Menu item to be displayed in the card */
    item: MenuItem & { image: Image | null };
    language: string;
}

/** Display each menu item as a card in the full restaurant menu */
export const MenuItemCard: FC<Props> = ({ item, language }) => {
    const { classes, cx } = useStyles({ imageColor: item?.image?.color });
    const [modalVisible, setModalVisible] = useState(false);
    let sizes: { id: string; size: string; price: string }[] = [];

    try {
        if (typeof item.sizes === "string") {
            sizes = JSON.parse(item.sizes);
            if (!Array.isArray(sizes)) {
                sizes = [];
            }
        } else if (Array.isArray(item.sizes)) {
            sizes = item.sizes;
        } else {
            sizes = [];
        }
    } catch (error) {
        console.error("Failed to parse sizes JSON:", error);
        sizes = [];
    }
    
  //  console.log("Parsed sizes:", sizes); // Debugging: Log the parsed sizes
    

    return (
        <>
            <Paper
                className={classes.cardItem}
                data-testid="menu-item-card"
                h="auto" // Auto height so it expands with content
                onClick={() => setModalVisible(true)}
            >
                <Flex direction="row" gap="md" align="flex-start" justify="space-between" style={{ width: "100%" }}>
                    {/* Image Section */}
                    {item?.image?.path && (
                        <Box className={classes.cardImageWrap}>
                            <ImageKitImage
                                blurhash={item?.image?.blurHash}
                                color={item?.image?.color}
                                height={150}
                                imageAlt={item.name}
                                imagePath={item?.image?.path}
                                width={150}
                            />
                        </Box>
                    )}

                    {/* Content Section */}
                    <Stack className={classes.cardDescWrap} style={{ flex: 1 }}>
                        <Text className={cx(classes.cardText, classes.cardItemTitle)} size="lg" weight={700}>
                            {language === "en" ? item.name : item.name_ar || item.name}
                        </Text>

                        {/* Price & Sizes Section */}
                        <Flex direction="row" gap="xs" align="center">
                            {/* Main Price */}
                            {item.price && (
                                <Text color="red" size="sm">
                                    {item.price}
                                </Text>
                            )}

                            {/* Sizes and Prices */}
                            {Array.isArray(sizes) && sizes.length > 0 && (
                                <Text color="red" size="sm">
                                    {sizes.map((size: { id: string; size: string; price: string }) => (
                                        <span key={size.id}>
                                            {size.size}: {size.price}{" "}
                                        </span>
                                    ))}
                                </Text>
                            )}
                        </Flex>

                        {/* Description */}
                        <Text className={cx(classes.cardText, classes.cardItemDesc)} opacity={0.7} size="xs">
                            {item.description}
                        </Text>
                    </Stack>
                </Flex>
            </Paper>
            <ViewMenuItemModal menuItem={item} onClose={() => setModalVisible(false)} opened={modalVisible} />
        </>
    );
};
import type { FC } from "react";
import { useMemo, useState } from "react";
import { Box, createStyles, Paper, Stack, Text } from "@mantine/core";
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
            width: "100%",
        },
        cardImage: {
            height: 150,
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
    item: MenuItem & { image: Image | null };
    language: string;
}

/** Display each menu item as a card in the full restaurant menu */
export const MenuItemCard: FC<Props> = ({ item, language }) => {
    const { classes, cx } = useStyles({ imageColor: item?.image?.color });
    const [modalVisible, setModalVisible] = useState(false);
    const sizes = item.sizes ? JSON.parse(item.sizes as string) : [];

    return (
        <>
            <Paper
                className={classes.cardItem}
                data-testid="menu-item-card"
                h={150}
                onClick={() => setModalVisible(true)}
            >
                {item?.image?.path && (
                    <Box className={classes.cardImageWrap}>
                        <Box className={classes.cardImage}>
                            <ImageKitImage
                                blurhash={item?.image?.blurHash}
                                color={item?.image?.color}
                                height={150}
                                imageAlt={item.name}
                                imagePath={item?.image?.path}
                                width={150}
                            />
                        </Box>
                    </Box>
                )}

                <Stack className={classes.cardDescWrap}>
                    <Text className={cx(classes.cardText, classes.cardItemTitle)} size="lg" weight={700}>
                        {language === "en" ? item.name : item.name_ar || item.name}
                    </Text>
                    {item.price && (
                        <Text color="red" size="sm">
                            {item.price}
                        </Text>
                    )}
                {sizes.length > 0 && (
                        <Text color="red" size="sm">
                            {sizes.map((size: { size: string; price: string }) => (
                                <span key={`${size.size}-${size.price}`}>
                                    {size.size}: {size.price}
                                </span>
                            ))}
                        </Text>
                    )}
                    <Text className={cx(classes.cardText, classes.cardItemDesc)} opacity={0.7} size="xs">
                        {item.description}
                    </Text>
                </Stack>
            </Paper>
            <ViewMenuItemModal menuItem={item} onClose={() => setModalVisible(false)} opened={modalVisible} />
        </>
    );
};
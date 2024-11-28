import type { FC } from "react";
import { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import { Button, Group, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useTranslations } from "next-intl";

import type { ModalProps } from "@mantine/core";
import type { Image, MenuItem } from "@prisma/client";

import { api } from "src/utils/api";
import { showErrorToast, showSuccessToast } from "src/utils/helpers";
import { menuItemInput } from "src/utils/validators";

import { ImageUpload } from "../ImageUpload";
import { Modal } from "../Modal";

interface Props extends ModalProps {
    /** Id of the category that the item belongs to */
    categoryId: string;
    /** Id of the menu that the item belongs to */
    menuId: string;
    /** Menu item to be edited */
    menuItem?: MenuItem & { image?: Image };
}

/** Form to be used when allowing users to add or edit menu items of restaurant menus categories */
export const MenuItemForm: FC<Props> = ({ opened, onClose, menuId, menuItem, categoryId, ...rest }) => {
    const trpcCtx = api.useContext();
    const t = useTranslations("dashboard.editMenu.menuItem");
    const tCommon = useTranslations("common");

    const { mutate: createMenuItem, isLoading: isCreating } = api.menuItem.create.useMutation({
        onError: (err) => showErrorToast(t("createError"), err),
        onSuccess: (data) => {
            onClose();
            trpcCtx.category.getAll.setData({ menuId }, (categories) =>
                categories?.map((item) => (item.id === categoryId ? { ...item, items: [...item.items, data] } : item))
            );
            showSuccessToast(
                tCommon("createSuccess"),
                t("createSuccessDesc", { name: data.name, name_ar: data.name_ar })
            );
        },
    });

    const { mutate: updateMenuItem, isLoading: isUpdating } = api.menuItem.update.useMutation({
        onError: (err) => showErrorToast(t("updateError"), err),
        onSuccess: (data) => {
            onClose();
            trpcCtx.category.getAll.setData({ menuId }, (categories) =>
                categories?.map((categoryItem) =>
                    categoryItem.id === categoryId
                        ? {
                              ...categoryItem,
                              items: categoryItem.items?.map((item) => (item.id === data.id ? data : item)),
                          }
                        : categoryItem
                )
            );
            showSuccessToast(tCommon("updateSuccess"), t("updateSuccessDesc", { name: data.name }));
        },
    });

    interface Size {
        id: string;
        price: string;
        size: string;
    }

    const { getInputProps, onSubmit, setValues, isDirty, resetDirty, values } = useForm({
        initialValues: {
            description: menuItem?.description || "",
            imageBase64: "",
            imagePath: menuItem?.image?.path || "",
            name: menuItem?.name || "",
            name_ar: menuItem?.name_ar || "",
            price: menuItem?.price || "",
            sizes: typeof menuItem?.sizes === "string" ? JSON.parse(menuItem.sizes).map((size: Size) => ({ ...size, id: uuidv4() })) : [] as Size[],
        },
        validate: zodResolver(menuItemInput),
    });

    useEffect(() => {
        if (opened) {
            const newValues = {
                description: menuItem?.description || "",
                imageBase64: "",
                imagePath: menuItem?.image?.path || "",
                name: menuItem?.name || "",
                name_ar: menuItem?.name_ar || "",
                price: menuItem?.price || "",
                sizes: typeof menuItem?.sizes === "string" ? JSON.parse(menuItem.sizes).map((size: Size) => ({ ...size, id: uuidv4() })) : [],
            };
            setValues(newValues);
            resetDirty(newValues);
        }
    }, [menuItem, opened]);

    const loading = isCreating || isUpdating;

    const handleAddSize = () => {
        setValues((prevValues) => ({
            ...prevValues,
            sizes: [...prevValues.sizes, { id: uuidv4(), price: "", size: "" }],
        }));
    };

    const handleSizeChange = (index: number, field: string, value: string) => {
        setValues((prevValues) => {
            const newSizes = [...prevValues.sizes];
            newSizes[index] = { ...newSizes[index], [field]: value };
            return { ...prevValues, sizes: newSizes };
        });
    };

    const handleRemoveSize = (index: number) => {
        setValues((prevValues) => {
            const newSizes = prevValues.sizes.filter((_: any, i: number) => i !== index);
            return { ...prevValues, sizes: newSizes };
        });
    };

    const handleFormSubmit = (formValues: any) => {
        const adjustedValues = {
            ...formValues,
            price: formValues.price || null,
        };

        if (menuItem) {
            updateMenuItem({ ...adjustedValues, id: menuItem?.id });
        } else if (categoryId) {
            createMenuItem({ ...adjustedValues, categoryId, menuId });
        } else {
            onClose();
        }
    };

    return (
        <Modal
            loading={loading}
            onClose={onClose}
            opened={opened}
            title={menuItem ? t("updateModalTitle") : t("createModalTitle")}
            {...rest}
        >
            <form onSubmit={onSubmit(handleFormSubmit)}>
                <Stack spacing="sm">
                    <TextInput
                        disabled={loading}
                        label={t("inputNameLabel")}
                        placeholder={t("inputNamePlaceholder")}
                        withAsterisk
                        {...getInputProps("name")}
                        autoFocus
                    />
                    <TextInput
                        disabled={loading}
                        label={t("inputNameLabelArabic")}
                        placeholder={t("inputNamePlaceholderArabic")}
                        withAsterisk
                        {...getInputProps("name_ar")}
                    />
                    <TextInput
                        disabled={loading}
                        label={t("inputPriceLabel")}
                        placeholder={t("inputPricePlaceholder")}
                        {...getInputProps("price")}
                    />
                    <Textarea
                        disabled={loading}
                        label={t("inputDescriptionLabel")}
                        minRows={3}
                        {...getInputProps("description")}
                    />
                    <ImageUpload
                        disabled={loading}
                        height={400}
                        imageHash={menuItem?.image?.blurHash}
                        imageUrl={values?.imagePath}
                        onImageCrop={(imageBase64, imagePath) => setValues({ imageBase64, imagePath })}
                        onImageDeleteClick={() => setValues({ imageBase64: "", imagePath: "" })}
                        width={400}
                    />
                    <Button onClick={handleAddSize} variant="outline">
                        {t("addSizeButtonLabel")}
                    </Button>
                    {values.sizes.map((size: Size, index: number) => (
                        <Group key={size.id} mt="sm">
                            <TextInput
                                disabled={loading}
                                label={t("inputSizeLabel")}
                                onChange={(event) => handleSizeChange(index, "size", event.currentTarget.value)}
                                placeholder={t("inputSizePlaceholder")}
                                value={size.size}
                                withAsterisk
                            />
                            <TextInput
                                disabled={loading}
                                label={t("inputSizePriceLabel")}
                                onChange={(event) => handleSizeChange(index, "price", event.currentTarget.value)}
                                placeholder={t("inputSizePricePlaceholder")}
                                value={size.price}
                                withAsterisk
                            />
                            <Button color="red" onClick={() => handleRemoveSize(index)} variant="outline">
                                {t("removeSizeButtonLabel")}
                            </Button>
                        </Group>
                    ))}
                    <Group mt="md" position="right">
                        <Button data-testid="save-menu-item-form" loading={loading} px="xl" type="submit">
                            {tCommon("save")}
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Modal>
    );
};
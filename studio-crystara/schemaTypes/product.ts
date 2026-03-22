import { defineType, defineField } from 'sanity'

export const product = defineType({
    name: 'product',
    title: 'Product',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            description: 'Stone or variant name (e.g. "Amethyst", "Tiger Eye")',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'name', maxLength: 96 },
        }),
        defineField({
            name: 'stone',
            title: 'Stone Type',
            type: 'string',
            description: 'The crystal/stone type',
        }),
        defineField({
            name: 'price',
            title: 'Price (₹)',
            type: 'number',
            validation: (rule) => rule.required().positive(),
        }),
        defineField({
            name: 'originalPrice',
            title: 'Original Price (₹)',
            type: 'number',
            description: 'MRP / strike-through price',
        }),
        defineField({
            name: 'Image',
            title: 'Upload Image',
            type: 'image',
            description: 'Upload an image of the product',
        }),
        defineField({
            name: 'galleryImages',
            title: 'Gallery Images',
            type: 'array',
            of: [{ type: 'image' }],
            description: 'Upload 4-5 additional product images for the detail page gallery',
        }),
        defineField({
            name: 'benefit',
            title: 'Benefit',
            type: 'string',
            description: 'Healing / metaphysical benefit (e.g. "Peace & intuition")',
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'reference',
            to: [{ type: 'productCategory' }],
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'subCategory',
            title: 'Sub-Category',
            type: 'reference',
            to: [{ type: 'productSubCategory' }],
            validation: (rule) => rule.required(),
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'benefit',
            category: 'category.name',
            subCategory: 'subCategory.name',
        },
        prepare({ title, category, subCategory }) {
            return {
                title,
                subtitle: `${category || ''} → ${subCategory || ''}`,
            }
        },
    },
})

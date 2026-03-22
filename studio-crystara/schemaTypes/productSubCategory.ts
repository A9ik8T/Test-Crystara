import { defineType, defineField } from 'sanity'

export const productSubCategory = defineType({
    name: 'productSubCategory',
    title: 'Product Sub-Category',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'name', maxLength: 96 },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'category',
            title: 'Parent Category',
            type: 'reference',
            to: [{ type: 'productCategory' }],
            validation: (rule) => rule.required(),
        }),
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'category.name',
        },
    },
})

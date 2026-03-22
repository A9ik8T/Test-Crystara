import { defineType, defineField } from 'sanity'

export const productCategory = defineType({
    name: 'productCategory',
    title: 'Product Category',
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
    ],
    preview: {
        select: { title: 'name' },
    },
})

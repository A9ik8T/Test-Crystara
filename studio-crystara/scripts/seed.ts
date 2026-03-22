/**
 * Seed script to populate Sanity with product data from the existing hardcoded catalog.
 *
 * Usage:
 *   cd studio-crystara
 *   npx tsx scripts/seed.ts
 */

import { createClient } from '@sanity/client'

const client = createClient({
    projectId: '24b9t1zn',
    dataset: 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token: process.env.SANITY_TOKEN,
})

// ── Existing product data (replicated from frontend/src/data/products.ts) ──

const cdn = 'https://www.maitriexport.com/cdn/shop/files'

const categoryImages: Record<string, string[]> = {
    'chip-bracelet': [
        `${cdn}/4mm-crystal-round-beads-stretchable-bracelet-895439_d62ff6da-dc6c-4417-bbd0-c2be338e8048.jpg?v=1712657083&width=800`,
        `${cdn}/4mm-crystal-round-beads-stretchable-bracelet-126907_a7c5f123-1d4a-494a-9ab3-f216d4deaee9.jpg?v=1712657083&width=800`,
        `${cdn}/3_786dd41e-5c1c-4726-b104-0d0cee8c590c.png?v=1734678946&width=800`,
        `${cdn}/4_d65c7564-50ba-460e-8bf7-3097c04d9ea9.png?v=1734678948&width=800`,
    ],
    'beads-bracelet': [
        `${cdn}/7-chakra-with-clear-quartz-stretchable-8mm-crystal-bracelet-944445.jpg?v=1712657044&width=800`,
        `${cdn}/10mm-round-beads-stretchable-bracelet-979669.jpg?v=1712657034&width=800`,
        `${cdn}/7-chakra-bracelet-344348.jpg?v=1712656994&width=800`,
        `${cdn}/triple-main.jpg?v=1699444759&width=800`,
        `${cdn}/2.jpg?v=1699444354&width=800`,
        `${cdn}/7-chakra-bracelet-with-evil-eye-851097_f6eb364f-ced1-433d-b666-d3c758ca2e8f.jpg?v=1712657047&width=800`,
    ],
    ring: [
        `${cdn}/1-109.jpg?v=1699449319&width=800`,
        `${cdn}/1-100.jpg?v=1699449319&width=800`,
        `${cdn}/1_308057d3-4129-45e8-ab10-1c314c4240a3.png?v=1723792481&width=800`,
        `${cdn}/1_4fba65bb-1f0a-41f0-a5a7-45402fee3f64.png?v=1709876459&width=800`,
    ],
    pendant: [
        `${cdn}/2-9_a7cb4b62-9086-49bf-a114-50a855cf324f.jpg?v=1699446728&width=800`,
        `${cdn}/1-10_4e6874da-7ec5-41fd-8bf1-181e8fb39825.jpg?v=1699446728&width=800`,
        `${cdn}/mix-1.jpg?v=1699446935&width=800`,
        `${cdn}/1-29_369a016c-775c-415a-b608-b823018c16fc.jpg?v=1699446935&width=800`,
        `${cdn}/Untitled-design-2022-01-26T103138.058.jpg?v=1699448275&width=800`,
        `${cdn}/81coa0ubGTL.jpg?v=1699448275&width=800`,
        `${cdn}/1_773e9223-f10e-48db-a49d-9b0f6adea9c4.jpg?v=1715233598&width=800`,
        `${cdn}/Untitled-design-2022-01-26T105523.559.jpg?v=1699446682&width=800`,
    ],
    pyramid: [
        `${cdn}/Engraved-symbols.png?v=1707995749&width=800`,
        `${cdn}/1_b85c84cf-aa70-4632-ae6e-c3b2df964393.png?v=1709897642&width=800`,
    ],
    frame: [
        `${cdn}/638e817b4e0601340c2cef92-8-pieces-hexagonal-pointed-quartz.jpg?v=1709897472&width=800`,
    ],
}

function getImageKey(categorySlug: string, subCategorySlug: string): string {
    if (categorySlug === 'rings') return 'ring'
    if (categorySlug === 'lockets') return 'pendant'
    if (categorySlug === 'pyramids') return 'pyramid'
    if (categorySlug === 'frames') return 'frame'
    return subCategorySlug
}

function getProductThumbnail(categorySlug: string, subCategorySlug: string, index: number): string {
    const key = getImageKey(categorySlug, subCategorySlug)
    const images = categoryImages[key] || categoryImages['beads-bracelet']
    return images[index % images.length]
}

const stoneBenefits: Record<string, string> = {
    'Money Magnet': 'Attracts wealth & prosperity',
    'Green Aventurine': 'Luck & opportunity',
    Turquoise: 'Protection & healing',
    Lapis: 'Wisdom & truth',
    Amethyst: 'Peace & intuition',
    'Citrine Natural': 'Joy & abundance',
    Citrine: 'Success & creativity',
    'Clear Quartz': 'Clarity & amplification',
    'Rose Quartz': 'Love & emotional healing',
    'Sun Stone': 'Vitality & leadership',
    Sunstone: 'Vitality & leadership',
    'Green Jade': 'Harmony & balance',
    'Black Tourmaline': 'Protection & grounding',
    Pyrite: 'Confidence & manifestation',
    'Golden Pyrite': 'Abundance & willpower',
    Opal: 'Creativity & inspiration',
    Opalite: 'Transition & communication',
    Hematite: 'Grounding & focus',
    'Tiger Eye': 'Courage & confidence',
    '7 Chakra': 'Balance all chakras',
    'OM Money Multi Crystal': 'Spiritual abundance',
    'OM Money Black': 'Protection & prosperity',
    'Rainbow Moon Stone': 'Intuition & new beginnings',
    'Rainbow Moonstone': 'Intuition & new beginnings',
    'Blue Gold Stone': 'Ambition & drive',
    Larvikite: 'Patience & grounding',
    Sodalite: 'Logic & truth',
    Dalmatian: 'Joy & playfulness',
    'Sulemani Hakik': 'Protection & stability',
    Orange: 'Creativity & enthusiasm',
    'Pink Onyx': 'Emotional balance',
    'Black Onyx': 'Strength & protection',
    Aquamarine: 'Calm & clarity',
    'Ruby Matrix': 'Passion & vitality',
    'Black Ocean Jasper': 'Tranquility & wholeness',
    'Yellow Quartz': 'Optimism & clarity',
    Amazonite: 'Truth & communication',
    'Blood Stone': 'Courage & vitality',
    Serpentine: 'Kundalini awakening',
    'Laxmi Wealth': 'Goddess blessings & prosperity',
    'Orgone Pyramid': 'Energy harmonization',
    'Laxmi Orgone Pyramid with Pyrite Chips': 'Divine wealth attraction',
    '7 Chakra Orgone': 'Full chakra alignment',
    'Anahata Orgone': 'Heart chakra healing',
    'Green Jade Zhu Orgone': 'Luck & protection',
    '7 Horse Vastu': 'Success & power',
    'Gayatri Mantra': 'Spiritual wisdom',
    'Zhu Symbol': 'Prosperity & luck',
    Ganesh: 'Obstacle removal',
    '7 Horse with Sun': 'Vitality & success',
    'Tree of Life': 'Growth & connection',
    'Shree Kuber Mantra': 'Wealth attraction',
    'Shree Sampurna Kuber Laxmi Yantra': 'Complete prosperity',
    'Saraswati Maa': 'Knowledge & arts',
    'Ganesh Ji': 'Blessings & wisdom',
    'Laxmi Mata': 'Wealth & fortune',
    'Hanuman Ji': 'Strength & devotion',
    'Ram Lala': 'Divine grace',
    'Shiv Shakti': 'Universal energy',
    'Radha Krishna': 'Divine love',
    'Tirupati Balaji': 'Blessings & fulfillment',
    'Hamsa with Buddha': 'Protection & enlightenment',
}

const categoryPricing: Record<string, { price: number; originalPrice: number }> = {
    'chip-bracelet': { price: 999, originalPrice: 2000 },
    'beads-bracelet': { price: 1199, originalPrice: 2200 },
    ring: { price: 1299, originalPrice: 3000 },
    pendant: { price: 599, originalPrice: 1500 },
    pyramid: { price: 1199, originalPrice: 2200 },
    frame: { price: 999, originalPrice: 2000 },
}

function getPricing(categorySlug: string, subCategorySlug: string) {
    if (categorySlug === 'bracelets') {
        return subCategorySlug === 'chip-bracelet'
            ? categoryPricing['chip-bracelet']
            : categoryPricing['beads-bracelet']
    }
    if (categorySlug === 'rings') return categoryPricing['ring']
    if (categorySlug === 'lockets') return categoryPricing['pendant']
    if (categorySlug === 'pyramids') return categoryPricing['pyramid']
    if (categorySlug === 'frames') return categoryPricing['frame']
    return { price: 999, originalPrice: 2000 }
}

// Stone lists
const chipBraceletStones = ['Money Magnet', 'Green Aventurine', 'Turquoise', 'Lapis', 'Amethyst', 'Citrine Natural', 'Clear Quartz', 'Rose Quartz', 'Sun Stone', 'Green Jade', 'Black Tourmaline', 'Pyrite', 'Opal', 'Hematite']
const beadsBraceletStones = ['Tiger Eye', 'Money Magnet', 'Green Aventurine', 'Lapis', 'Amethyst', 'Citrine', 'Citrine Natural', 'Rose Quartz', 'Sun Stone', 'Green Jade', 'Pyrite', 'Hematite', '7 Chakra', 'Golden Pyrite', 'Sunstone', 'OM Money Multi Crystal', 'OM Money Black', 'Opalite']
const ringStones = ['Tiger Eye', 'Lapis', 'Amethyst', 'Citrine', 'Rose Quartz', 'Green Jade', 'Pyrite', 'Rainbow Moon Stone', 'Turquoise']
const ringStyles = ['Diamond Cut Oval Faced', 'Round Gem Stone', 'Heart Shaped', 'Feather Touch', 'Moon Shaped', 'Boho']
const silverCapStones = ['Tiger Eye', 'Lapis', 'Amethyst', 'Black Tourmaline', 'Clear Quartz', 'Larvikite', 'Sodalite', 'Rose Quartz', 'Dalmatian']
const heartPendantStones = ['Tiger Eye', 'Lapis', 'Amethyst', 'Blue Gold Stone', 'Clear Quartz', 'Rose Quartz', 'Sunstone', 'Green Jade']
const tortoisePendantStones = ['Tiger Eye', 'Lapis', 'Amethyst', 'Black Tourmaline', 'Clear Quartz', 'Opalite', 'Green Aventurine', 'Rose Quartz']
const moonOwlStones = ['Tiger Eye', 'Lapis', 'Amethyst', 'Rose Quartz', 'Green Aventurine']
const threadWrappedStones = ['Sulemani Hakik', 'Orange', 'Pink Onyx', 'Amethyst', 'Black Onyx', 'Aquamarine', 'Citrine', 'Clear Quartz', 'Green Aventurine', 'Ruby Matrix', 'Rainbow Moonstone']
const silverWireWrappedStones = ['Tiger Eye', '7 Chakra', 'Clear Quartz', 'Rose Quartz']
const rawStonePendantStones = ['Tiger Eye', 'Lapis', 'Amethyst', 'Black Ocean Jasper', 'Yellow Quartz', 'Amazonite', 'Blood Stone', 'Clear Quartz', 'Rainbow Moonstone', 'Rose Quartz', 'Serpentine']
const orgonePyramidTypes = ['Laxmi Wealth', 'Orgone Pyramid', 'Money Magnet', 'Laxmi Orgone Pyramid with Pyrite Chips', '7 Chakra Orgone', 'Anahata Orgone', 'Green Jade Zhu Orgone']
const singleStonePyramidStones = ['Lapis', 'Pyrite', 'Citrine', 'Amethyst', 'Rose Quartz', 'Green Jade', 'Black Tourmaline']
const pyriteFrameDesigns = ['7 Horse Vastu', 'Gayatri Mantra', 'Zhu Symbol', 'Ganesh', '7 Horse with Sun', 'Tree of Life', 'Shree Kuber Mantra', 'Shree Sampurna Kuber Laxmi Yantra']
const pyriteMultiFrameDesigns = ['Saraswati Maa', 'Ganesh Ji', 'Laxmi Mata', 'Hanuman Ji', 'Ram Lala', 'Shiv Shakti', 'Radha Krishna', 'Tirupati Balaji', 'Hamsa with Buddha']

interface CatalogCategory {
    id: string
    name: string
    slug: string
    subCategories: {
        id: string
        name: string
        slug: string
        stones: string[]
    }[]
}

const productCatalog: CatalogCategory[] = [
    {
        id: 'bracelets', name: 'Bracelets', slug: 'bracelets',
        subCategories: [
            { id: 'chip-bracelet', name: 'Chip Bracelet', slug: 'chip-bracelet', stones: chipBraceletStones },
            { id: 'beads-bracelet', name: 'Beads Bracelet', slug: 'beads-bracelet', stones: beadsBraceletStones },
        ],
    },
    {
        id: 'rings', name: 'Rings', slug: 'rings',
        subCategories: ringStyles.map((style) => ({
            id: style.toLowerCase().replace(/\s+/g, '-'),
            name: style,
            slug: style.toLowerCase().replace(/\s+/g, '-'),
            stones: ringStones,
        })),
    },
    {
        id: 'lockets', name: 'Lockets / Pendants', slug: 'lockets',
        subCategories: [
            { id: 'silver-cap-pendant', name: 'Silver Cap Pendant', slug: 'silver-cap-pendant', stones: silverCapStones },
            { id: 'heart-shaped-pendant', name: 'Heart Shaped Pendant', slug: 'heart-shaped-pendant', stones: heartPendantStones },
            { id: 'tortoise-shaped-pendant', name: 'Tortoise Shaped Pendant', slug: 'tortoise-shaped-pendant', stones: tortoisePendantStones },
            { id: 'moon-owl-shaped-pendant', name: 'Moon Owl Shaped Pendant', slug: 'moon-owl-shaped-pendant', stones: moonOwlStones },
            { id: 'thread-wrapped-pendant', name: 'Thread Wrapped Pendant', slug: 'thread-wrapped-pendant', stones: threadWrappedStones },
            { id: 'silver-wire-wrapped-pendant', name: 'Silver Wire Wrapped Pendant', slug: 'silver-wire-wrapped-pendant', stones: silverWireWrappedStones },
            { id: 'raw-stone-pendant', name: 'Raw Stone Pendant', slug: 'raw-stone-pendant', stones: rawStonePendantStones },
        ],
    },
    {
        id: 'pyramids', name: 'Pyramids', slug: 'pyramids',
        subCategories: [
            { id: 'orgone-pyramid', name: 'Orgone Pyramid', slug: 'orgone-pyramid', stones: orgonePyramidTypes },
            { id: 'single-stone-pyramid', name: 'Single Stone Pyramid', slug: 'single-stone-pyramid', stones: singleStonePyramidStones },
        ],
    },
    {
        id: 'frames', name: 'Frames', slug: 'frames',
        subCategories: [
            { id: 'pyrite-frame', name: 'Pyrite Frame (6/6 inch)', slug: 'pyrite-frame', stones: pyriteFrameDesigns },
            { id: 'pyrite-multi-frame', name: 'Pyrite Multi Frame Golden Base', slug: 'pyrite-multi-frame', stones: pyriteMultiFrameDesigns },
        ],
    },
]

// ── Helper: make a deterministic Sanity document _id ──

function makeId(...parts: string[]): string {
    return parts
        .join('-')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

// ── Main seed function ──

async function seed() {
    console.log('🌱 Starting seed…')

    // Batch size for transactions
    const BATCH_SIZE = 100

    // 1. Create categories
    const categoryDocs = productCatalog.map((cat) => ({
        _id: `category-${makeId(cat.slug)}`,
        _type: 'productCategory' as const,
        name: cat.name,
        slug: { _type: 'slug' as const, current: cat.slug },
    }))

    console.log(`📁 Creating ${categoryDocs.length} categories…`)
    let tx = client.transaction()
    for (const doc of categoryDocs) {
        tx = tx.createOrReplace(doc)
    }
    await tx.commit()
    console.log('✅ Categories created')

    // 2. Create sub-categories
    const subCategoryDocs: Array<{
        _id: string
        _type: 'productSubCategory'
        name: string
        slug: { _type: 'slug'; current: string }
        category: { _type: 'reference'; _ref: string }
    }> = []

    for (const cat of productCatalog) {
        for (const sub of cat.subCategories) {
            subCategoryDocs.push({
                _id: `subcategory-${makeId(cat.slug, sub.slug)}`,
                _type: 'productSubCategory',
                name: sub.name,
                slug: { _type: 'slug', current: sub.slug },
                category: { _type: 'reference', _ref: `category-${makeId(cat.slug)}` },
            })
        }
    }

    console.log(`📂 Creating ${subCategoryDocs.length} sub-categories…`)
    tx = client.transaction()
    for (const doc of subCategoryDocs) {
        tx = tx.createOrReplace(doc)
    }
    await tx.commit()
    console.log('✅ Sub-categories created')

    // 3. Create products (variants) in batches
    interface ProductDoc {
        _id: string
        _type: 'product'
        name: string
        slug: { _type: 'slug'; current: string }
        stone: string
        price: number
        originalPrice: number
        imageUrl: string
        benefit: string
        category: { _type: 'reference'; _ref: string }
        subCategory: { _type: 'reference'; _ref: string }
    }

    const productDocs: ProductDoc[] = []

    for (const cat of productCatalog) {
        for (const sub of cat.subCategories) {
            sub.stones.forEach((stone, index) => {
                const pricing = getPricing(cat.slug, sub.slug)
                const id = makeId(cat.slug, sub.slug, stone)
                productDocs.push({
                    _id: `product-${id}`,
                    _type: 'product',
                    name: stone,
                    slug: { _type: 'slug', current: id },
                    stone,
                    price: pricing.price,
                    originalPrice: pricing.originalPrice,
                    imageUrl: getProductThumbnail(cat.slug, sub.slug, index),
                    benefit: stoneBenefits[stone] || 'Healing & balance',
                    category: { _type: 'reference', _ref: `category-${makeId(cat.slug)}` },
                    subCategory: {
                        _type: 'reference',
                        _ref: `subcategory-${makeId(cat.slug, sub.slug)}`,
                    },
                })
            })
        }
    }

    console.log(`🔮 Creating ${productDocs.length} products in batches of ${BATCH_SIZE}…`)

    for (let i = 0; i < productDocs.length; i += BATCH_SIZE) {
        const batch = productDocs.slice(i, i + BATCH_SIZE)
        tx = client.transaction()
        for (const doc of batch) {
            tx = tx.createOrReplace(doc)
        }
        await tx.commit()
        console.log(`  ✅ Batch ${Math.floor(i / BATCH_SIZE) + 1} done (${Math.min(i + BATCH_SIZE, productDocs.length)}/${productDocs.length})`)
    }

    console.log('\n🎉 Seed complete!')
    console.log(`   ${categoryDocs.length} categories`)
    console.log(`   ${subCategoryDocs.length} sub-categories`)
    console.log(`   ${productDocs.length} products`)
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
})

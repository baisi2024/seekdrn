import { buildTree, flattenTree } from '../tree'
import type { NavigationItem } from '../types'

describe('buildTree', () => {
  it('should return empty array for empty input', () => {
    expect(buildTree([])).toEqual([])
  })

  it('should build tree with single root item', () => {
    const items: NavigationItem[] = [
      {
        id: '1',
        position: 'header',
        parent_id: null,
        order_index: 0,
        link_type: 'internal',
        url: '/home',
        translations: { en: 'Home', zh: '首页' },
        published: true,
      },
    ]

    const result = buildTree(items)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
    expect(result[0].children).toBeUndefined()
  })

  it('should build tree with parent-child relationship', () => {
    const items: NavigationItem[] = [
      {
        id: '1',
        position: 'header',
        parent_id: null,
        order_index: 0,
        link_type: 'internal',
        url: '/products',
        translations: { en: 'Products', zh: '产品' },
        published: true,
      },
      {
        id: '2',
        position: 'header',
        parent_id: '1',
        order_index: 0,
        link_type: 'internal',
        url: '/products/drones',
        translations: { en: 'Drones', zh: '无人机' },
        published: true,
      },
    ]

    const result = buildTree(items)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
    expect(result[0].children).toHaveLength(1)
    expect(result[0].children![0].id).toBe('2')
  })

  it('should sort items by order_index', () => {
    const items: NavigationItem[] = [
      {
        id: '3',
        position: 'header',
        parent_id: null,
        order_index: 2,
        link_type: 'internal',
        url: '/contact',
        translations: { en: 'Contact', zh: '联系我们' },
        published: true,
      },
      {
        id: '1',
        position: 'header',
        parent_id: null,
        order_index: 0,
        link_type: 'internal',
        url: '/home',
        translations: { en: 'Home', zh: '首页' },
        published: true,
      },
      {
        id: '2',
        position: 'header',
        parent_id: null,
        order_index: 1,
        link_type: 'internal',
        url: '/about',
        translations: { en: 'About', zh: '关于' },
        published: true,
      },
    ]

    const result = buildTree(items)

    expect(result).toHaveLength(3)
    expect(result[0].id).toBe('1')
    expect(result[1].id).toBe('2')
    expect(result[2].id).toBe('3')
  })

  it('should sort children by order_index', () => {
    const items: NavigationItem[] = [
      {
        id: '1',
        position: 'header',
        parent_id: null,
        order_index: 0,
        link_type: 'internal',
        url: '/products',
        translations: { en: 'Products', zh: '产品' },
        published: true,
      },
      {
        id: '3',
        position: 'header',
        parent_id: '1',
        order_index: 1,
        link_type: 'internal',
        url: '/products/software',
        translations: { en: 'Software', zh: '软件' },
        published: true,
      },
      {
        id: '2',
        position: 'header',
        parent_id: '1',
        order_index: 0,
        link_type: 'internal',
        url: '/products/drones',
        translations: { en: 'Drones', zh: '无人机' },
        published: true,
      },
    ]

    const result = buildTree(items)

    expect(result[0].children).toHaveLength(2)
    expect(result[0].children![0].id).toBe('2')
    expect(result[0].children![1].id).toBe('3')
  })

  it('should handle multiple root items', () => {
    const items: NavigationItem[] = [
      {
        id: '1',
        position: 'header',
        parent_id: null,
        order_index: 0,
        link_type: 'internal',
        url: '/home',
        translations: { en: 'Home', zh: '首页' },
        published: true,
      },
      {
        id: '2',
        position: 'header',
        parent_id: null,
        order_index: 1,
        link_type: 'internal',
        url: '/about',
        translations: { en: 'About', zh: '关于' },
        published: true,
      },
    ]

    const result = buildTree(items)

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('1')
    expect(result[1].id).toBe('2')
  })

  it('should handle nested children (grandchildren)', () => {
    const items: NavigationItem[] = [
      {
        id: '1',
        position: 'header',
        parent_id: null,
        order_index: 0,
        link_type: 'internal',
        url: '/products',
        translations: { en: 'Products', zh: '产品' },
        published: true,
      },
      {
        id: '2',
        position: 'header',
        parent_id: '1',
        order_index: 0,
        link_type: 'internal',
        url: '/products/drones',
        translations: { en: 'Drones', zh: '无人机' },
        published: true,
      },
      {
        id: '3',
        position: 'header',
        parent_id: '2',
        order_index: 0,
        link_type: 'internal',
        url: '/products/drones/commercial',
        translations: { en: 'Commercial', zh: '商用' },
        published: true,
      },
    ]

    const result = buildTree(items)

    expect(result[0].children![0].children).toHaveLength(1)
    expect(result[0].children![0].children![0].id).toBe('3')
  })
})

describe('flattenTree', () => {
  it('should return empty array for empty input', () => {
    expect(flattenTree([])).toEqual([])
  })

  it('should flatten single item without children', () => {
    const items: NavigationItem[] = [
      {
        id: '1',
        position: 'header',
        parent_id: null,
        order_index: 0,
        link_type: 'internal',
        url: '/home',
        translations: { en: 'Home', zh: '首页' },
        published: true,
      },
    ]

    const result = flattenTree(items)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
    expect(result[0].children).toBeUndefined()
  })

  it('should flatten tree with children', () => {
    const items: NavigationItem[] = [
      {
        id: '1',
        position: 'header',
        parent_id: null,
        order_index: 0,
        link_type: 'internal',
        url: '/products',
        translations: { en: 'Products', zh: '产品' },
        published: true,
        children: [
          {
            id: '2',
            position: 'header',
            parent_id: '1',
            order_index: 0,
            link_type: 'internal',
            url: '/products/drones',
            translations: { en: 'Drones', zh: '无人机' },
            published: true,
          },
        ],
      },
    ]

    const result = flattenTree(items)

    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('1')
    expect(result[1].id).toBe('2')
    expect(result[0].children).toBeUndefined()
    expect(result[1].children).toBeUndefined()
  })

  it('should flatten nested tree (grandchildren)', () => {
    const items: NavigationItem[] = [
      {
        id: '1',
        position: 'header',
        parent_id: null,
        order_index: 0,
        link_type: 'internal',
        url: '/products',
        translations: { en: 'Products', zh: '产品' },
        published: true,
        children: [
          {
            id: '2',
            position: 'header',
            parent_id: '1',
            order_index: 0,
            link_type: 'internal',
            url: '/products/drones',
            translations: { en: 'Drones', zh: '无人机' },
            published: true,
            children: [
              {
                id: '3',
                position: 'header',
                parent_id: '2',
                order_index: 0,
                link_type: 'internal',
                url: '/products/drones/commercial',
                translations: { en: 'Commercial', zh: '商用' },
                published: true,
              },
            ],
          },
        ],
      },
    ]

    const result = flattenTree(items)

    expect(result).toHaveLength(3)
    expect(result[0].id).toBe('1')
    expect(result[1].id).toBe('2')
    expect(result[2].id).toBe('3')
  })

  it('should remove children property from all items', () => {
    const items: NavigationItem[] = [
      {
        id: '1',
        position: 'header',
        parent_id: null,
        order_index: 0,
        link_type: 'internal',
        url: '/products',
        translations: { en: 'Products', zh: '产品' },
        published: true,
        children: [
          {
            id: '2',
            position: 'header',
            parent_id: '1',
            order_index: 0,
            link_type: 'internal',
            url: '/products/drones',
            translations: { en: 'Drones', zh: '无人机' },
            published: true,
          },
        ],
      },
    ]

    const result = flattenTree(items)

    result.forEach((item) => {
      expect(item.children).toBeUndefined()
    })
  })
})

describe('buildTree and flattenTree integration', () => {
  it('should be reversible: flattenTree(buildTree(items)) should equal original items', () => {
    const items: NavigationItem[] = [
      {
        id: '1',
        position: 'header',
        parent_id: null,
        order_index: 0,
        link_type: 'internal',
        url: '/products',
        translations: { en: 'Products', zh: '产品' },
        published: true,
      },
      {
        id: '2',
        position: 'header',
        parent_id: '1',
        order_index: 0,
        link_type: 'internal',
        url: '/products/drones',
        translations: { en: 'Drones', zh: '无人机' },
        published: true,
      },
      {
        id: '3',
        position: 'header',
        parent_id: '1',
        order_index: 1,
        link_type: 'internal',
        url: '/products/software',
        translations: { en: 'Software', zh: '软件' },
        published: true,
      },
    ]

    const tree = buildTree(items)
    const flattened = flattenTree(tree)

    // 检查数量相同
    expect(flattened).toHaveLength(items.length)

    // 检查所有项都存在且属性正确
    items.forEach((originalItem) => {
      const flattenedItem = flattened.find((item) => item.id === originalItem.id)
      expect(flattenedItem).toBeDefined()
      expect(flattenedItem!.position).toBe(originalItem.position)
      expect(flattenedItem!.parent_id).toBe(originalItem.parent_id)
      expect(flattenedItem!.order_index).toBe(originalItem.order_index)
      expect(flattenedItem!.link_type).toBe(originalItem.link_type)
      expect(flattenedItem!.url).toBe(originalItem.url)
      expect(flattenedItem!.translations).toEqual(originalItem.translations)
      expect(flattenedItem!.published).toBe(originalItem.published)
    })
  })
})

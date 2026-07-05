/**
 * Pagination helper — parse query params & slice data
 * Supports: page, limit, sort, search, filter
 */

/**
 * Parse pagination params from request query.
 * @param {object} query
 * @returns {{ page: number, limit: number, sort: string, order: string, search: string, filter: object }}
 */
export function parsePagination(query = {}) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const sort = query.sort || 'createdAt';
  const queryOrder = String(query.order || 'desc').toLowerCase();
  const order = ['asc', 'desc'].includes(queryOrder) ? queryOrder : 'desc';
  const search = (query.search || '').trim();

  let filter = {};
  if (query.filter) {
    try {
      filter = typeof query.filter === 'string' ? JSON.parse(query.filter) : query.filter;
    } catch {
      filter = {};
    }
  }

  return { page, limit, sort, order, search, filter };
}

/**
 * Paginate an array of items.
 * @param {any[]} items
 * @param {{ page: number, limit: number }} pagination
 * @returns {{ items: any[], meta: object }}
 */
export function paginate(items, { page, limit }) {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const sliced = items.slice(offset, offset + limit);

  return {
    items: sliced,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
}

/**
 * Apply search filter to an array of objects.
 * Searches all string/number fields.
 * @param {any[]} items
 * @param {string} search
 * @param {string[]} [fields] — specific fields to search (optional)
 */
export function applySearch(items, search, fields = []) {
  if (!search) return items;
  const q = search.toLowerCase();
  return items.filter((item) => {
    const searchFields = fields.length ? fields : Object.keys(item);
    return searchFields.some((key) => {
      const val = item[key];
      if (typeof val === 'string') return val.toLowerCase().includes(q);
      if (typeof val === 'number') return String(val).includes(q);
      return false;
    });
  });
}

/**
 * Apply sort to an array of objects.
 * @param {any[]} items
 * @param {string} sort — field name
 * @param {'asc'|'desc'} order
 */
export function applySort(items, sort, order = 'desc') {
  if (!sort) return items;
  return [...items].sort((a, b) => {
    const av = a[sort] ?? '';
    const bv = b[sort] ?? '';
    if (typeof av === 'string' && typeof bv === 'string') {
      return order === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return order === 'asc' ? av - bv : bv - av;
  });
}

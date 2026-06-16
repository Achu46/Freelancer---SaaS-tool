export function mapDocs(snapshot) {
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function sortByTimestamp(items, field, order = 'asc') {
  return items.sort((a, b) => {
    const tA = a[field]?.toMillis?.() || a[field]?.seconds * 1000 || 0;
    const tB = b[field]?.toMillis?.() || b[field]?.seconds * 1000 || 0;
    return order === 'asc' ? tA - tB : tB - tA;
  });
}

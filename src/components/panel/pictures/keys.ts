/**
 * Chave do React Query do "quadro": banco de fotos + seções, numa action
 * só (`getSectionsBoard`). As telas /pictures e /sections leem a mesma —
 * enviar ou excluir numa atualiza a outra. O `useActionQuery` acrescenta
 * o input no fim.
 */
export const BOARD_QUERY_KEY = ["sections", "board"] as const;

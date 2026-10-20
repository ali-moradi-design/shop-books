import type { Book } from '../../../../domain/book/book.entity';
import { toBookDto } from '../../../../application/book/dto/book.mapper';

export function presentBook(book: Book, opts: { withSample?: boolean } = {}) {
  const dto = toBookDto(book);
  return opts.withSample ? { ...dto, sample: book.sample } : dto;
}

export function presentBooks(books: Book[]) {
  return books.map((b) => presentBook(b));
}

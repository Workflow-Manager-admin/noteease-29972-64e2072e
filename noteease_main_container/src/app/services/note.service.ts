import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Note } from '../models/note.model';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private notes = new BehaviorSubject<Note[]>([]);
  private readonly STORAGE_KEY = 'noteease_notes';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.loadNotes();
  }

  // PUBLIC_INTERFACE
  /**
   * Get all notes as an observable
   */
  getNotes(): Observable<Note[]> {
    return this.notes.asObservable();
  }

  // PUBLIC_INTERFACE
  /**
   * Get active (non-archived) notes
   */
  getActiveNotes(): Observable<Note[]> {
    return this.notes.pipe(
      map(notes => notes.filter(note => !note.isArchived))
    );
  }

  // PUBLIC_INTERFACE
  /**
   * Get archived notes
   */
  getArchivedNotes(): Observable<Note[]> {
    return this.notes.pipe(
      map(notes => notes.filter(note => note.isArchived))
    );
  }

  // PUBLIC_INTERFACE
  /**
   * Add a new note
   */
  addNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newNote: Note = {
      ...note,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const currentNotes = this.notes.value;
    this.notes.next([...currentNotes, newNote]);
    this.saveNotes();
  }

  // PUBLIC_INTERFACE
  /**
   * Update an existing note
   */
  updateNote(id: string, updates: Partial<Note>): void {
    const currentNotes = this.notes.value;
    const updatedNotes = currentNotes.map(note => 
      note.id === id ? { ...note, ...updates, updatedAt: new Date() } : note
    );
    this.notes.next(updatedNotes);
    this.saveNotes();
  }

  // PUBLIC_INTERFACE
  /**
   * Delete a note
   */
  deleteNote(id: string): void {
    const currentNotes = this.notes.value;
    this.notes.next(currentNotes.filter(note => note.id !== id));
    this.saveNotes();
  }

  // PUBLIC_INTERFACE
  /**
   * Toggle pin status of a note
   */
  togglePin(id: string): void {
    const currentNotes = this.notes.value;
    const note = currentNotes.find(n => n.id === id);
    if (note) {
      this.updateNote(id, { isPinned: !note.isPinned });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Toggle archive status of a note
   */
  toggleArchive(id: string): void {
    const currentNotes = this.notes.value;
    const note = currentNotes.find(n => n.id === id);
    if (note) {
      this.updateNote(id, { isArchived: !note.isArchived });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Search notes by title, content, or categories
   */
  searchNotes(query: string): Observable<Note[]> {
    return this.notes.pipe(
      map(notes => notes.filter(note => 
        note.title.toLowerCase().includes(query.toLowerCase()) ||
        note.content.toLowerCase().includes(query.toLowerCase()) ||
        note.categories.some(cat => cat.toLowerCase().includes(query.toLowerCase()))
      ))
    );
  }

  private loadNotes(): void {
    if (this.isBrowser) {
      const savedNotes = window.localStorage.getItem(this.STORAGE_KEY);
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        // Convert string dates back to Date objects
        const notes = parsedNotes.map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt)
        }));
        this.notes.next(notes);
      }
    }
  }

  private saveNotes(): void {
    if (this.isBrowser) {
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notes.value));
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

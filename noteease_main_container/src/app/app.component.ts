import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { NoteCardComponent } from './components/note-card/note-card.component';
import { NoteDialogComponent } from './components/note-dialog/note-dialog.component';
import { NoteService } from './services/note.service';
import { Note } from './models/note.model';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    NoteCardComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private readonly noteService = inject(NoteService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  searchQuery = new BehaviorSubject<string>('');
  showArchived = false;
  allCategories: Set<string> = new Set();
  selectedCategories: Set<string> = new Set();

  filteredNotes$ = combineLatest([
    this.noteService.getNotes(),
    this.searchQuery
  ]).pipe(
    map(([notes, query]) => {
      return notes
        .filter(note => !note.isArchived === !this.showArchived)
        .filter(note => {
          if (this.selectedCategories.size === 0) return true;
          return note.categories.some(cat => this.selectedCategories.has(cat));
        })
        .filter(note =>
          query ? (
            note.title.toLowerCase().includes(query.toLowerCase()) ||
            note.content.toLowerCase().includes(query.toLowerCase()) ||
            note.categories.some(cat => cat.toLowerCase().includes(query.toLowerCase()))
          ) : true
        )
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        });
    })
  );

  ngOnInit() {
    this.noteService.getNotes().subscribe(notes => {
      this.allCategories = new Set(
        notes.flatMap(note => note.categories)
      );
    });
  }

  onSearch(query: string) {
    this.searchQuery.next(query);
  }

  toggleCategory(category: string) {
    if (this.selectedCategories.has(category)) {
      this.selectedCategories.delete(category);
    } else {
      this.selectedCategories.add(category);
    }
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories.has(category);
  }

  toggleArchiveView() {
    this.showArchived = !this.showArchived;
  }

  openNoteDialog(note?: Note) {
    const dialogRef = this.dialog.open(NoteDialogComponent, {
      width: '600px',
      data: note || null
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (note) {
          this.noteService.updateNote(note.id, result);
          this.showSnackBar('Note updated successfully');
        } else {
          this.noteService.addNote(result);
          this.showSnackBar('Note created successfully');
        }
      }
    });
  }

  onDeleteNote(id: string) {
    this.noteService.deleteNote(id);
    this.showSnackBar('Note deleted successfully');
  }

  onPinNote(id: string) {
    this.noteService.togglePin(id);
  }

  onArchiveNote(id: string) {
    this.noteService.toggleArchive(id);
    this.showSnackBar(this.showArchived ? 'Note unarchived' : 'Note archived');
  }

  private showSnackBar(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom'
    });
  }
}

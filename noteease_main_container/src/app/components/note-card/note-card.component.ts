import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatChipsModule, MatButtonModule],
  template: `
    <mat-card class="note-card" [class.pinned]="note.isPinned">
      <mat-card-header>
        <mat-card-title>{{ note.title }}</mat-card-title>
        <div class="header-actions">
          <button mat-icon-button (click)="onPin.emit(note.id)" [color]="note.isPinned ? 'accent' : ''">
            <mat-icon>push_pin</mat-icon>
          </button>
          <button mat-icon-button (click)="onArchive.emit(note.id)">
            <mat-icon>archive</mat-icon>
          </button>
        </div>
      </mat-card-header>
      
      <mat-card-content>
        <p class="note-content">{{ note.content }}</p>
        <mat-chip-set *ngIf="note.categories.length > 0">
          <mat-chip *ngFor="let category of note.categories">{{ category }}</mat-chip>
        </mat-chip-set>
      </mat-card-content>
      
      <mat-card-actions align="end">
        <button mat-icon-button (click)="onEdit.emit(note)">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button color="warn" (click)="onDelete.emit(note.id)">
          <mat-icon>delete</mat-icon>
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .note-card {
      margin: 8px;
      max-width: 300px;
      width: 100%;
      transition: transform 0.2s ease-in-out;
    }

    .note-card:hover {
      transform: translateY(-2px);
    }

    .note-card.pinned {
      border: 2px solid #FFC107;
    }

    .header-actions {
      margin-left: auto;
    }

    .note-content {
      margin: 16px 0;
      white-space: pre-wrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }

    mat-chip-set {
      margin-top: 8px;
    }
  `]
})
export class NoteCardComponent {
  @Input() note!: Note;
  @Output() onEdit = new EventEmitter<Note>();
  @Output() onDelete = new EventEmitter<string>();
  @Output() onPin = new EventEmitter<string>();
  @Output() onArchive = new EventEmitter<string>();
}

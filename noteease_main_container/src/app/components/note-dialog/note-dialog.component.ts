import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Note } from '../../models/note.model';

@Component({
  selector: 'app-note-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit Note' : 'Create Note' }}</h2>
    <mat-dialog-content>
      <form #noteForm="ngForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Title</mat-label>
          <input matInput [(ngModel)]="note.title" name="title" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Content</mat-label>
          <textarea matInput [(ngModel)]="note.content" name="content" rows="5" required></textarea>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Categories (comma-separated)</mat-label>
          <input matInput [(ngModel)]="categoryInput" name="categories" 
                 (keyup.enter)="addCategory()" placeholder="Enter categories">
          <mat-hint>Press Enter to add a category</mat-hint>
        </mat-form-field>

        <mat-chip-set>
          <mat-chip *ngFor="let category of note.categories" (removed)="removeCategory(category)">
            {{category}}
            <button matChipRemove>
              <mat-icon>cancel</mat-icon>
            </button>
          </mat-chip>
        </mat-chip-set>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="!noteForm.form.valid"
              (click)="onSave()">
        Save
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    mat-chip-set {
      margin-bottom: 16px;
    }

    textarea {
      min-height: 100px;
    }
  `]
})
export class NoteDialogComponent {
  note: Partial<Note>;
  categoryInput: string = '';

  constructor(
    public dialogRef: MatDialogRef<NoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Note | null
  ) {
    this.note = data ? { ...data } : {
      title: '',
      content: '',
      categories: [],
      isPinned: false,
      isArchived: false
    };
  }

  addCategory(): void {
    if (this.categoryInput.trim()) {
      const newCategories = this.categoryInput.split(',')
        .map(cat => cat.trim())
        .filter(cat => cat && !this.note.categories?.includes(cat));
      
      this.note.categories = [
        ...(this.note.categories || []),
        ...newCategories
      ];
      this.categoryInput = '';
    }
  }

  removeCategory(category: string): void {
    const index = this.note.categories?.indexOf(category);
    if (index !== undefined && index >= 0) {
      this.note.categories?.splice(index, 1);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.categoryInput.trim()) {
      this.addCategory();
    }
    this.dialogRef.close(this.note);
  }
}

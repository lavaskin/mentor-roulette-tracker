import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

type ToastSeverity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast';

interface ToastMessage {
	severity?: ToastSeverity;
	summary?: string;
	detail?: string;
	life?: number;
	key?: string;
	sticky?: boolean;
	closable?: boolean;
	data?: unknown;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
	private _messageService = inject(MessageService);
	private readonly _defaultLife = 5000;

	public show(message: ToastMessage): void {
		this._messageService.add({
			life: this._defaultLife,
			...message,
		});
	}

	public showToast(severity: ToastSeverity, summary: string, detail?: string, life?: number): void {
		this.show({
			severity,
			summary,
			detail,
			life: life ?? this._defaultLife,
		});
	}

	public showSuccess(summary: string, detail?: string, life?: number): void {
		this.showToast('success', summary, detail, life);
	}

	public showInfo(summary: string, detail?: string, life?: number): void {
		this.showToast('info', summary, detail, life);
	}

	public showWarning(summary: string, detail?: string, life?: number): void {
		this.showToast('warn', summary, detail, life);
	}

	public showError(summary: string, detail?: string, life?: number): void {
		this.showToast('error', summary, detail, life);
	}

	public clear(key?: string): void {
		this._messageService.clear(key);
	}

	public showApiError(summary: string, error: unknown, fallbackDetail: string): void {
		this.showError(summary, this.getApiErrorMessage(error) ?? fallbackDetail);
	}

	private getApiErrorMessage(error: unknown): string | null {
		if (error instanceof HttpErrorResponse) {
			if (typeof error.error === 'string' && error.error.trim().length > 0) {
				return error.error;
			}

			if (error.error && typeof error.error === 'object') {
				const payload = error.error as { Error?: string; error?: string; Details?: string };
				return payload.Error ?? payload.error ?? payload.Details ?? null;
			}

			return error.message || null;
		}

		if (error instanceof Error) {
			return error.message;
		}

		return null;
	}
}

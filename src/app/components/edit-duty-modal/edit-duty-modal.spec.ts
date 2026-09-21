import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DutyModel } from '@app/models/entity/duty.model';
import { EditDutyModal } from './edit-duty-modal';

@Component({
	imports: [EditDutyModal],
	template: `<mrt-edit-duty-modal [visible]="visible()" [isNew]="true" [duty]="duty()" />`,
})
class HostComponent {
	public visible = signal(false);
	public duty = signal<DutyModel | null>(null);
}

function getModal(fixture: ComponentFixture<HostComponent>): EditDutyModal {
	return fixture.debugElement.query(By.directive(EditDutyModal)).componentInstance;
}

describe('EditDutyModal', () => {
	it('pre-fills the name when a duty is bound before the first render', () => {
		const fixture = TestBed.createComponent(HostComponent);
		fixture.componentInstance.duty.set({ name: 'Aurum Vale' });
		fixture.componentInstance.visible.set(true);
		fixture.detectChanges();

		expect(getModal(fixture).form.get('name')!.value).toBe('Aurum Vale');
	});

	it('pre-fills the name when a duty is bound after the first render', () => {
		const fixture = TestBed.createComponent(HostComponent);
		fixture.componentInstance.visible.set(true);
		fixture.detectChanges();

		fixture.componentInstance.duty.set({ name: 'Copperbell Mines' });
		fixture.detectChanges();

		expect(getModal(fixture).form.get('name')!.value).toBe('Copperbell Mines');
	});
});

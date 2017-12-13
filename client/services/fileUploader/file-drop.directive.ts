import { Directive, EventEmitter, ElementRef, HostListener, Input, Output } from '@angular/core';
import {ProjectsService} from "../projects.service";


@Directive({selector: '[ng2FileDrop]'})
export class FileDropDirective {
    @Input() public uploader:ProjectsService;
    @Output() public fileOver:EventEmitter<any> = new EventEmitter();
    @Output() public onFileDrop:EventEmitter<File> = new EventEmitter<File>();

    private element:ElementRef;
    public constructor(element:ElementRef) {
        this.element = element;
    }

    @HostListener('drop', ['$event'])
    public onDrop(event:any):void {
        this._preventAndStop(event);
        let transfer = this._getTransfer(event);
        if (!transfer) {
            return;
        }

        var file:File = transfer.files[0];
        
        this.uploader.setFileToUpload(file);
        this.fileOver.emit(false);
        this.onFileDrop.emit(file);
    }

    @HostListener('dragover', ['$event'])
    public onDragOver(event:any):void {
        this._preventAndStop(event);
        let transfer = this._getTransfer(event);
        if (!this._haveFiles(transfer.types)) {
            return;
        }

        transfer.dropEffect = 'copy';
        this.fileOver.emit(true);
    }

    @HostListener('dragleave', ['$event'])
    public onDragLeave(event:any):any {
        this._preventAndStop(event);

        if (event.currentTarget === (this as any).element[0]) {
            return;
        }

        this.fileOver.emit(false);
    }

    private _getTransfer(event:any):any {
        return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer; // jQuery fix;
    }

    private _preventAndStop(event:any):any {
        event.preventDefault();
        event.stopPropagation();
    }

    private _haveFiles(types:any):any {
        if (!types) {
            return false;
        }

        if (types.indexOf) {
            return types.indexOf('Files') !== -1;
        } else if (types.contains) {
            return types.contains('Files');
        } else {
            return false;
        }
    }
}
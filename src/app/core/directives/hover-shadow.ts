import { Directive, ElementRef, Renderer2, HostListener } from '@angular/core';

@Directive({
  selector: '[appHoverShadow]', // HTML mein use karne ke liye yeh selector naam hai
  standalone: true
})
export class HoverShadowDirective {

  // ElementRef se hume woh HTML element milta hai jis par directive lagi ho
  // Renderer2 se hum us element ki styling safe tareeqay se change karte hain
  constructor(private el: ElementRef, private renderer: Renderer2) {}

  // 1. Jab Mouse Element Ke Upar Aaye (Hover In)
  @HostListener('mouseenter') onMouseEnter() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1.02)');
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', '0 10px 20px rgba(0, 0, 0, 0.12)');
    this.renderer.setStyle(this.el.nativeElement, 'transition', 'all 0.3s ease');
    this.renderer.setStyle(this.el.nativeElement, 'cursor', 'pointer');
  }

  // 2. Jab Mouse Element Se Baahar Chala Jaye (Hover Out)
  @HostListener('mouseleave') onMouseLeave() {
    this.renderer.setStyle(this.el.nativeElement, 'transform', 'scale(1)');
    this.renderer.setStyle(this.el.nativeElement, 'box-shadow', 'none');
  }
}
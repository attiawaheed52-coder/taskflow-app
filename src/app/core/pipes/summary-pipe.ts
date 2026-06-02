import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'summary',
  standalone: true // Modern Angular architecture ke liye standalone true
})
export class SummaryPipe implements PipeTransform {

  // transform method data ko modify karta hai
  transform(value: string, limit: number = 15): string {
    if (!value) return '';
    
    // Agar text limit se bada hai to cut karke '...' laga do, nahi to poora text dikhao
    return value.length > limit ? value.substring(0, limit) + '...' : value;
  }

}
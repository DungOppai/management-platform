import React from 'react';
import { LayersIcon } from 'lucide-react';

export function BrandMark() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-fg">
        <LayersIcon className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-ink">AI ProjectHub</span>
    </span>);

}
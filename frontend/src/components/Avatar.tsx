import React from 'react';
import { UserIcon } from 'lucide-react';
import { toneClasses } from '../data/taskMeta';
import type { Member } from '../types/project';

interface AvatarProps {
  member?: Member;
  size?: 'sm' | 'md';
}

const sizes = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-xs'
};

export function Avatar({ member, size = 'sm' }: AvatarProps) {
  if (!member) {
    return (
      <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-subtle text-ink-faint ${sizes[size]}`}>
        <UserIcon className="h-3 w-3" aria-hidden="true" />
      </span>);

  }
  return (
    <span
      title={member.name}
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold ${toneClasses[member.tone]} ${sizes[size]}`}>
      
      {member.initials}
    </span>);

}
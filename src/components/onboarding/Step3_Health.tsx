import React from 'react';
import type { UserProfile } from '../../types';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';

interface StepProps {
  data: UserProfile;
  onDataChange: (data: Partial<UserProfile>) => void;
}

export const Step3_Health: React.FC<StepProps> = ({ data, onDataChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="injuries">Infortuni pregressi o attuali</Label>
        <Textarea 
          id="injuries"
          placeholder="Es. Ernia L5-S1, tendinite alla spalla..."
          value={data.injuries || ''}
          onChange={(e) => onDataChange({ injuries: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="pathologies">Patologie note</Label>
        <Textarea 
          id="pathologies"
          placeholder="Es. Ipertensione, problemi posturali..."
          value={data.pathologies || ''}
          onChange={(e) => onDataChange({ pathologies: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="mobility_issues">Limitazioni di mobilità</Label>
        <Textarea 
          id="mobility_issues"
          placeholder="Es. Scarsa mobilità caviglie, spalle bloccate..."
          value={data.mobility_issues || ''}
          onChange={(e) => onDataChange({ mobility_issues: e.target.value })}
        />
      </div>
    </div>
  );
};
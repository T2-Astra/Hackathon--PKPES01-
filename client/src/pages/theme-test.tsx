import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Moon, Sun, Laptop, Leaf } from 'lucide-react';

export default function ThemeTestComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-6 space-y-6 bg-background text-foreground min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Dark Theme Test</h1>
          <p className="text-muted-foreground">Testing all theme components and colors</p>
        </div>

        {/* Theme Switcher */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Switcher</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                onClick={() => setTheme('light')}
                className="flex items-center gap-2"
              >
                <Sun className="w-4 h-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                onClick={() => setTheme('dark')}
                className="flex items-center gap-2"
              >
                <Moon className="w-4 h-4" />
                Dark
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                onClick={() => setTheme('system')}
                className="flex items-center gap-2"
              >
                <Laptop className="w-4 h-4" />
                System
              </Button>
              <Button
                variant={theme === 'nature' ? 'default' : 'outline'}
                onClick={() => setTheme('nature')}
                className="flex items-center gap-2"
              >
                <Leaf className="w-4 h-4" />
                Nature
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Current theme: <Badge>{theme}</Badge>
            </p>
          </CardContent>
        </Card>

        {/* Color Palette Test */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-12 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground text-sm font-medium">Primary</span>
                </div>
                <div className="h-12 bg-secondary rounded-md flex items-center justify-center">
                  <span className="text-secondary-foreground text-sm font-medium">Secondary</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-muted rounded-md flex items-center justify-center">
                  <span className="text-muted-foreground text-sm font-medium">Muted</span>
                </div>
                <div className="h-12 bg-accent rounded-md flex items-center justify-center">
                  <span className="text-accent-foreground text-sm font-medium">Accent</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-card border rounded-md flex items-center justify-center">
                  <span className="text-card-foreground text-sm font-medium">Card</span>
                </div>
                <div className="h-12 bg-destructive rounded-md flex items-center justify-center">
                  <span className="text-destructive-foreground text-sm font-medium">Destructive</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-12 bg-background border rounded-md flex items-center justify-center">
                  <span className="text-foreground text-sm font-medium">Background</span>
                </div>
                <div className="h-12 border border-border rounded-md flex items-center justify-center">
                  <span className="text-foreground text-sm font-medium">Border</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Colors Test */}
        <Card>
          <CardHeader>
            <CardTitle>Department Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { name: 'AI/ML', class: 'department-ai' },
                { name: 'Civil', class: 'department-civil' },
                { name: 'Mechanical', class: 'department-mechanical' },
                { name: 'Computer', class: 'department-computer' },
                { name: 'Electrical', class: 'department-electrical' },
                { name: 'Electronics', class: 'department-electronics' },
                { name: 'Big Data', class: 'department-bigdata' },
              ].map((dept) => (
                <div key={dept.name} className={`${dept.class} p-3 rounded-lg border dept-accent dept-bg`}>
                  <div className="text-sm font-medium text-center">{dept.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Interactive Elements Test */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Elements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="space-y-2">
                <Input placeholder="Test input field..." />
                <div className="flex gap-2">
                  <Badge>Default Badge</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

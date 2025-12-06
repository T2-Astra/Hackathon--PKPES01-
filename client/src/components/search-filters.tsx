import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, BookOpen, GraduationCap, Calendar, Building } from "lucide-react";
import { useLanguageContext } from "@/hooks/useLanguageContext";

interface SearchFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  department: string;
  setDepartment: (dept: string) => void;
  resourceType: string;
  setResourceType: (type: string) => void;
  semester: string;
  setSemester: (sem: string) => void;
  year: string;
  setYear: (year: string) => void;
  onSearch: () => void;
}

export default function SearchFilters({
  searchQuery,
  setSearchQuery,
  department,
  setDepartment,
  resourceType,
  setResourceType,
  semester,
  setSemester,
  year,
  setYear,
  onSearch,
}: SearchFiltersProps) {
  const { t } = useLanguageContext();
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/80 rounded-2xl border border-border/50 shadow-xl backdrop-blur-sm">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-2xl"></div>
      
      <div className="relative p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <div className="p-3 bg-primary/10 rounded-full mr-3">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-primary">
              Find Your Resources
            </h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Search through our comprehensive collection of academic materials
          </p>
        </div>

        <div className="space-y-8">
          {/* Search Input */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold text-foreground">Search Keywords</Label>
            </div>
            <div className="relative group">
              <Input
                type="text"
                placeholder="Search for subjects, topics, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-base bg-card border border-border rounded-xl transition-all duration-300 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-card hover:border-primary/60 hover:shadow-sm relative z-10 placeholder:text-muted-foreground"
                data-testid="input-search-query"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors z-20" />
            </div>
          </div>

          {/* Filters Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-primary" />
              <Label className="text-sm font-semibold text-foreground">Filter Options</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Department</Label>
                </div>
                <Select value={department} onValueChange={setDepartment} data-testid="select-department">
                  <SelectTrigger className="bg-background/50 border-2 border-border/50 rounded-lg hover:border-primary/30 transition-colors">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="ai">🤖 Artificial Intelligence</SelectItem>
                    <SelectItem value="civil">🏗️ Civil Engineering</SelectItem>
                    <SelectItem value="mechanical">⚙️ Mechanical Engineering</SelectItem>
                    <SelectItem value="computer">💻 Computer Engineering</SelectItem>
                    <SelectItem value="electrical">⚡ Electrical Engineering</SelectItem>
                    <SelectItem value="electronics">📡 Electronics Engineering</SelectItem>
                    <SelectItem value="bigdata">📊 Big Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Resource Type</Label>
                </div>
                <Select value={resourceType} onValueChange={setResourceType} data-testid="select-resource-type">
                  <SelectTrigger className="bg-background/50 border-2 border-border/50 rounded-lg hover:border-primary/30 transition-colors">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="question-papers">📝 Question Papers</SelectItem>
                    <SelectItem value="notes">📚 Study Notes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Semester</Label>
                </div>
                <Select value={semester} onValueChange={setSemester} data-testid="select-semester">
                  <SelectTrigger className="bg-background/50 border-2 border-border/50 rounded-lg hover:border-primary/30 transition-colors">
                    <SelectValue placeholder="All Semesters" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="all">All Semesters</SelectItem>
                    <SelectItem value="1">1st Semester</SelectItem>
                    <SelectItem value="2">2nd Semester</SelectItem>
                    <SelectItem value="3">3rd Semester</SelectItem>
                    <SelectItem value="4">4th Semester</SelectItem>
                    <SelectItem value="5">5th Semester</SelectItem>
                    <SelectItem value="6">6th Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Year</Label>
                </div>
                <Select value={year} onValueChange={setYear} data-testid="select-year">
                  <SelectTrigger className="bg-background/50 border-2 border-border/50 rounded-lg hover:border-primary/30 transition-colors">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg">
                    <SelectItem value="all">All Years</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                    <SelectItem value="2020">2020</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={onSearch}
              size="lg"
              className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground px-12 py-4 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
              data-testid="button-search-resources"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Search className="mr-2 h-5 w-5" />
              Search Resources
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

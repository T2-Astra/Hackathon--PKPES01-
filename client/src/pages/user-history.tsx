import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, History, Calendar, Filter } from "lucide-react";
import { useLocation } from "wouter";

interface SearchHistoryItem {
  _id: string;
  searchQuery: string;
  department?: string;
  resourceType?: string;
  semester?: number;
  year?: number;
  searchedAt: string;
}

export default function UserHistory() {
  const { user, token } = useAuth();
  const [, setLocation] = useLocation();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");

  useEffect(() => {
    if (!user) {
      setLocation('/');
      return;
    }
    
    fetchHistory();
  }, [user, token, setLocation]);

  const fetchHistory = async () => {
    if (!token) return;

    try {
      const response = await fetch('/api/user/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchFromHistory = (item: SearchHistoryItem) => {
    const params = new URLSearchParams();
    if (item.searchQuery) params.set('q', item.searchQuery);
    if (item.department) params.set('department', item.department);
    if (item.resourceType) params.set('type', item.resourceType);
    if (item.semester) params.set('semester', item.semester.toString());
    if (item.year) params.set('year', item.year.toString());

    setLocation(`/search?${params.toString()}`);
  };

  const filteredHistory = history.filter(item =>
    item.searchQuery.toLowerCase().includes(filterQuery.toLowerCase()) ||
    (item.department && item.department.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 pt-16 md:pt-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Search History</h1>
          <p className="text-muted-foreground">
            Your recent searches and activities
          </p>
        </div>
        <History className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your history..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      <Card>
        <CardHeader>
          <CardTitle>Search History</CardTitle>
          <CardDescription>
            Click on any item to repeat that search
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filterQuery ? 'No search history matches your filter' : 'No search history yet'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Start searching to build your history
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((item) => (  
                <div
                  key={item._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleSearchFromHistory(item)}
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{item.searchQuery}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {new Date(item.searchedAt).toLocaleDateString()} at{' '}
                        {new Date(item.searchedAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 flex-wrap">
                      {item.department && (
                        <Badge variant="secondary" className="text-xs">
                          {item.department}
                        </Badge>
                      )}
                      {item.resourceType && (
                        <Badge variant="outline" className="text-xs">
                          {item.resourceType}
                        </Badge>
                      )}
                      {item.semester && (
                        <Badge variant="outline" className="text-xs">
                          Semester {item.semester}
                        </Badge>
                      )}
                      {item.year && (
                        <Badge variant="outline" className="text-xs">
                          Year {item.year}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button size="sm" variant="ghost">
                    Search Again
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

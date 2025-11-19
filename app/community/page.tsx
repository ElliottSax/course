import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Plus, TrendingUp, Clock } from 'lucide-react'
import Link from 'next/link'
import { getInitials } from '@/lib/utils'

export default async function CommunityPage() {
  // In production, fetch from API
  const posts: any[] = []

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Community Forum</h1>
          <p className="text-muted-foreground">
            Connect with fellow students and ask questions
          </p>
        </div>
        <Button asChild>
          <Link href="/community/new">
            <Plus className="mr-2 h-4 w-4" />
            New Discussion
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="recent">
            <TabsList>
              <TabsTrigger value="recent">
                <Clock className="mr-2 h-4 w-4" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="trending">
                <TrendingUp className="mr-2 h-4 w-4" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="unanswered">
                <MessageSquare className="mr-2 h-4 w-4" />
                Unanswered
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-6">
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id}>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <Avatar>
                            <AvatarImage src={post.author.avatar_url} />
                            <AvatarFallback>
                              {getInitials(post.author.name)}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1">
                            <Link
                              href={`/community/${post.id}`}
                              className="mb-2 block hover:underline"
                            >
                              <h3 className="text-lg font-semibold">
                                {post.title}
                              </h3>
                            </Link>

                            <div className="mb-3 flex flex-wrap gap-2">
                              <Badge variant="secondary">{post.category}</Badge>
                              {post.tags?.map((tag: string) => (
                                <Badge key={tag} variant="outline">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{post.author.name}</span>
                              <span>•</span>
                              <span>
                                {new Date(post.created_at).toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span>{post._count?.replies || 0} replies</span>
                              <span>•</span>
                              <span>{post.upvotes || 0} upvotes</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="mb-2 text-lg font-semibold">
                      No discussions yet
                    </h3>
                    <p className="mb-4 text-muted-foreground">
                      Be the first to start a conversation
                    </p>
                    <Button asChild>
                      <Link href="/community/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Start Discussion
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="trending" className="mt-6">
              <Card>
                <CardContent className="py-12 text-center">
                  <TrendingUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No trending posts</h3>
                  <p className="text-muted-foreground">
                    Trending discussions will appear here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="unanswered" className="mt-6">
              <Card>
                <CardContent className="py-12 text-center">
                  <MessageSquare className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">All caught up!</h3>
                  <p className="text-muted-foreground">
                    No unanswered questions at the moment
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['React', 'JavaScript', 'TypeScript', 'CSS', 'Next.js'].map(
                  (tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Community Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Be respectful and kind</li>
                <li>• Search before posting</li>
                <li>• Provide context</li>
                <li>• Mark helpful answers</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

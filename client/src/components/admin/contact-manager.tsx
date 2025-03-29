import { useState } from "react";
import { useContactSubmissions, useMarkContactAsRead, useDeleteContactSubmission } from "@/lib/hooks/use-testimonials";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { type ContactSubmission } from "@shared/schema";

export function ContactManager() {
  const { toast } = useToast();
  const { data: submissions, isLoading } = useContactSubmissions();
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const markAsReadMutation = useMarkContactAsRead();
  const deleteMutation = useDeleteContactSubmission();

  const handleViewSubmission = (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    setIsViewDialogOpen(true);

    // If not already read, mark as read
    if (!submission.read) {
      markAsReadMutation.mutate(submission.id, {
        onError: (error) => {
          toast({
            title: "Error",
            description: "Failed to mark message as read.",
            variant: "destructive",
          });
          console.error(error);
        },
      });
    }
  };

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete === null) return;

    deleteMutation.mutate(itemToDelete, {
      onSuccess: () => {
        toast({
          title: "Message deleted",
          description: "The contact submission has been deleted successfully.",
        });
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
        
        // If the deleted item was being viewed, close the dialog
        if (selectedSubmission && selectedSubmission.id === itemToDelete) {
          setIsViewDialogOpen(false);
          setSelectedSubmission(null);
        }
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: "Failed to delete message.",
          variant: "destructive",
        });
        console.error(error);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Inquiries</CardTitle>
        <CardDescription>
          Manage and respond to inquiries from your website visitors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : submissions && submissions.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead className="w-[80px]">Status</TableHead>
                  <TableHead className="text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission: ContactSubmission) => (
                  <TableRow key={submission.id} className={!submission.read ? "bg-primary/5" : ""}>
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell>{submission.email}</TableCell>
                    <TableCell>{submission.eventType || "Not specified"}</TableCell>
                    <TableCell>{formatDistanceToNow(new Date(submission.createdAt), { addSuffix: true })}</TableCell>
                    <TableCell>
                      {submission.read ? (
                        <Badge variant="outline" className="text-muted-foreground">
                          Read
                        </Badge>
                      ) : (
                        <Badge variant="default" className="bg-primary">
                          New
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewSubmission(submission)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-100"
                          onClick={() => handleDeleteClick(submission.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              No contact submissions found yet.
            </p>
          </div>
        )}
      </CardContent>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Message</DialogTitle>
            <DialogDescription>
              Message details from {selectedSubmission?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium text-muted-foreground">From:</div>
                <div>{selectedSubmission.name}</div>
              </div>
              
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium text-muted-foreground">Email:</div>
                <div>{selectedSubmission.email}</div>
              </div>
              
              {selectedSubmission.phone && (
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <div className="font-medium text-muted-foreground">Phone:</div>
                  <div>{selectedSubmission.phone}</div>
                </div>
              )}
              
              {selectedSubmission.eventType && (
                <div className="grid grid-cols-[100px_1fr] gap-2">
                  <div className="font-medium text-muted-foreground">Event Type:</div>
                  <div>{selectedSubmission.eventType}</div>
                </div>
              )}
              
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <div className="font-medium text-muted-foreground">Date:</div>
                <div>{new Date(selectedSubmission.createdAt).toLocaleString()}</div>
              </div>
              
              <div className="border-t pt-4">
                <div className="font-medium text-muted-foreground mb-2">Message:</div>
                <div className="whitespace-pre-wrap rounded-md bg-muted p-4">{selectedSubmission.message}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            {selectedSubmission && (
              <Button
                variant="default"
                onClick={() => {
                  // Simple way to open default email client
                  window.location.href = `mailto:${selectedSubmission.email}?subject=RE: Your inquiry on EventForge&body=Hello ${selectedSubmission.name},`;
                }}
              >
                Reply by Email
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              message from your inbox.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useAuth } from "@/components/auth-provider";
import { 
  ScheduledMessage, 
  scheduleMessage, 
  cancelMessage,
  getDefaultTwilioNumber,
  MessageType,
  subscribeToMessages
} from "@/lib/message-service";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar as CalendarIcon,
  Phone, 
  MessageSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClient, setIsClient] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");
  
  const [formData, setFormData] = useState({
    contactName: "",
    messageContent: "",
    messageType: "sms" as MessageType,
    phoneNumber: ""
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Only run after client-side hydration
    if (!isClient) return;
    
    // If user is not logged in, redirect to login page
    if (!user) {
      router.push("/login");
      return;
    }
    
    if (user) {
      // Set the phone number from user profile if available
      if (user.phone) {
        setFormData(prev => ({ ...prev, phoneNumber: user.phone! }));
      }
      
      // Subscribe to real-time message updates
      const unsubscribe = subscribeToMessages(user.id, (updatedMessages) => {
        setMessages(updatedMessages);
        setIsLoading(false);
        setIsConnected(true);
      });

      // Handle connection errors
      const handleConnectionError = () => {
        setIsConnected(false);
        toast({
          variant: "destructive",
          title: "Connection lost",
          description: "Trying to reconnect to the database..."
        });
      };

      // Cleanup subscription on unmount
      return () => {
        unsubscribe();
      };
    }
  }, [user, router, isClient, toast]);

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return null;
  }

  // If user is not logged in or still loading, show nothing
  if (!user && !isLoading) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMessageTypeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      messageType: value as MessageType
    }));
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to schedule messages."
      });
      return;
    }
    
    if (!date) {
      toast({
        variant: "destructive",
        title: "Date required",
        description: "Please select a date for your message."
      });
      return;
    }
    
    if (!time) {
      toast({
        variant: "destructive",
        title: "Time required",
        description: "Please select a time for your message."
      });
      return;
    }
    
    // Create a date object with the selected date and time
    const [hours, minutes] = time.split(':').map(Number);
    const scheduledTime = new Date(date);
    scheduledTime.setHours(hours, minutes);
    
    // Ensure the scheduled time is at least 10 minutes in the future
    const minTime = new Date(Date.now() + 10 * 60 * 1000);
    if (scheduledTime < minTime) {
      toast({
        variant: "destructive",
        title: "Invalid time",
        description: "Scheduled time must be at least 10 minutes in the future."
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      await scheduleMessage({
        userId: user.id,
        contactName: formData.contactName,
        messageContent: formData.messageContent,
        phoneNumber: formData.phoneNumber,
        scheduledTime: scheduledTime,
        messageType: formData.messageType,
        status: 'pending'
      });
      
      toast({
        title: "Message scheduled",
        description: `Your ${formData.messageType} will be sent at ${format(scheduledTime, "PPpp")}.`
      });
      
      // Reset the form
      setFormData({
        contactName: "",
        messageContent: "",
        messageType: "sms",
        phoneNumber: user.phone || ""
      });
      setDate(new Date());
      setTime("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to schedule message",
        description: "An error occurred. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelMessage = async (messageId: string) => {
    if (!user) return;
    
    try {
      const success = await cancelMessage(user.id, messageId);
      
      if (success) {
        toast({
          title: "Message canceled",
          description: "Your scheduled message has been canceled."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Failed to cancel message",
          description: "An error occurred or the message has already been sent."
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to cancel message",
        description: "An error occurred. Please try again."
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      case 'sent':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Connection Status Indicator */}
      <div className={cn(
        "fixed top-16 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all",
        isConnected 
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      )}>
        {isConnected ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Reconnecting...</span>
          </>
        )}
      </div>

      <div className="flex-1 container py-24 px-4 md:px-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Real-time updates</span>
          </div>
        </div>
        
        <Tabs defaultValue="schedule" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="schedule">Schedule Message</TabsTrigger>
            <TabsTrigger value="messages">
              My Messages 
              {messages.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {messages.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Schedule a New Message</CardTitle>
                <CardDescription>
                  Create a new scheduled message to help you exit a situation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="messageType">Message Type</Label>
                    <RadioGroup 
                      id="messageType" 
                      defaultValue="sms" 
                      value={formData.messageType}
                      onValueChange={handleMessageTypeChange}
                      className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="sms" id="sms" />
                        <Label htmlFor="sms" className="flex items-center">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Text Message
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="voice" id="voice" />
                        <Label htmlFor="voice" className="flex items-center">
                          <Phone className="mr-2 h-4 w-4" />
                          Voice Call
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name</Label>
                    <Input 
                      id="contactName"
                      name="contactName"
                      placeholder="e.g., Boss, Mom, Doctor"
                      required
                      value={formData.contactName}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      This name will be used for your reference only
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="messageContent">Message Content</Label>
                    <Textarea 
                      id="messageContent"
                      name="messageContent"
                      placeholder={formData.messageType === 'sms' 
                        ? "e.g., Need you to come home right away, there's an emergency!" 
                        : "e.g., This is your boss. There's an urgent situation at work, please come immediately."}
                      required
                      value={formData.messageContent}
                      onChange={handleInputChange}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input 
                        id="time"
                        type="time"
                        required
                        value={time}
                        onChange={handleTimeChange}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Your Phone Number</Label>
                    <Input 
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="+1234567890"
                      required
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      This is the number that will receive the scheduled message
                    </p>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Scheduling..." : "Schedule Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>My Scheduled Messages</span>
                  {isConnected && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live</span>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  View and manage your scheduled messages (updates in real-time)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground mt-2">Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      You don't have any scheduled messages yet.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => document.querySelector('[value="schedule"]')?.dispatchEvent(new Event('click'))}
                    >
                      Schedule Your First Message
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contact</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Scheduled For</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {messages.map((message) => (
                          <TableRow key={message.id}>
                            <TableCell className="font-medium">{message.contactName}</TableCell>
                            <TableCell>
                              {message.messageType === 'sms' ? (
                                <div className="flex items-center">
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  <span>Text</span>
                                </div>
                              ) : (
                                <div className="flex items-center">
                                  <Phone className="mr-2 h-4 w-4" />
                                  <span>Voice</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {format(new Date(message.scheduledTime), "PPp")}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                {getStatusIcon(message.status)}
                                <span className="ml-2 capitalize">{message.status}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {message.status === 'pending' && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleCancelMessage(message.id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
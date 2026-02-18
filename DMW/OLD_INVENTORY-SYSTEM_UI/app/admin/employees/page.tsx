

"use client";

import { useState, useMemo } from "react";
import type { Employee } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmployeeForm, type EmployeeFormValues } from "@/components/employee-form";
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react";
import useFirestoreCollection from "@/hooks/use-firestore-collection";
import { useToast } from "@/hooks/use-toast";

export default function EmployeesPage() {
  const { data: employees, addItem, updateItem, deleteItem, loading } = useFirestoreCollection<Employee>("employees");
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const confirmDeleteEmployee = (id: string) => {
    setEmployeeToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    try {
        await deleteItem(employeeToDelete);
        toast({ title: "Success", description: "Employee deleted successfully." });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: "Failed to delete employee." });
    } finally {
        setEmployeeToDelete(null);
        setIsAlertOpen(false);
    }
  };

  const handleSaveEmployee = async (employeeData: EmployeeFormValues, id?: string) => {
    try {
      if (id) {
        await updateItem(id, employeeData);
        toast({ title: "Success", description: "Employee updated successfully." });
      } else {
        await addItem(employeeData);
        toast({ title: "Success", description: "Employee added successfully." });
      }
      setIsFormOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save employee." });
      // Keep the form open on error so the user can retry
    }
  };

  const filteredEmployees = useMemo(() => {
    return [...employees]
      .filter((employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [employees, searchTerm]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 md:p-8">
      <main className="max-w-7xl mx-auto space-y-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Employee Management</h1>
            <p className="text-muted-foreground">Manage employees</p>
          </div>
          <Button onClick={handleAddEmployee} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Employee
          </Button>
        </header>
        
        <Card>
            <CardHeader>
                <CardTitle>Search Employees</CardTitle>
                <CardDescription>Search by name</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-sm pl-10"
                    />
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
             <CardTitle>Employees</CardTitle>
             <CardDescription>A list of all employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     <TableRow>
                      <TableCell colSpan={2} className="text-center h-24">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEditEmployee(employee)}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => confirmDeleteEmployee(employee.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center h-24">
                        No employees found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit Employee" : "Add New Employee"}</DialogTitle>
             <DialogDescription>
              {editingEmployee ? "Update the details of the employee." : "Enter the details for the new employee."}
            </DialogDescription>
          </DialogHeader>
          <EmployeeForm
            employee={editingEmployee}
            onSubmit={handleSaveEmployee}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

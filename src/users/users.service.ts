import { Injectable } from "@nestjs/common";

type User = {
  id: number;
  email: string;
  password: string;
  username: string;
};

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      id: 1,
      email: "test@gmail.com",
      password: "123456",
      username: "test",
    },
  ];

  // GET all users
  findAll() {
    return this.users;
  }

  // LOGIN helper (find user by email)
  findByEmail(email: string) {
    return this.users.find((user) => user.email === email);
  }

  // UPDATE user
  update(id: string, body: Partial<User>) {
    this.users = this.users.map((user) =>
      user.id === Number(id)
        ? { ...user, ...body }
        : user
    );

    return {
      message: "User updated successfully",
      updatedUser: this.users.find((u) => u.id === Number(id)),
    };
  }
}
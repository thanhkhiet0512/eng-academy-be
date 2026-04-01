import { Injectable } from "@nestjs/common";
import { UserRepositoryPort } from "../../../domain/auth/ports/user.repository.port";
import { PasswordServicePort } from "../../../domain/auth/ports/password.service.port";
import { AppError } from "../../../common/errors/app.error";

export type UpdateProfileInput = {
  userId: string;
  name?: string;
  currentPassword?: string;
  newPassword?: string;
};

export type UpdateProfileResult = {
  id: string;
  name: string;
  email: string;
};

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    private readonly users: UserRepositoryPort,
    private readonly passwords: PasswordServicePort,
  ) {}

  async execute(input: UpdateProfileInput): Promise<UpdateProfileResult> {
    const user = await this.users.findById(input.userId);
    if (!user) throw AppError.notFound("Không tìm thấy tài khoản");

    const patch: { name?: string; passwordHash?: string } = {};

    if (input.name !== undefined) {
      const name = input.name.trim();
      if (name.length < 2) throw AppError.badRequest("Tên phải có ít nhất 2 ký tự");
      patch.name = name;
    }

    if (input.newPassword !== undefined) {
      if (!input.currentPassword) {
        throw AppError.badRequest("Vui lòng nhập mật khẩu hiện tại");
      }
      const ok = await this.passwords.compare(input.currentPassword, user.passwordHash);
      if (!ok) throw AppError.badRequest("Mật khẩu hiện tại không đúng", "WRONG_PASSWORD");
      if (input.newPassword.length < 8) {
        throw AppError.badRequest("Mật khẩu mới phải có ít nhất 8 ký tự");
      }
      patch.passwordHash = await this.passwords.hash(input.newPassword);
    }

    if (Object.keys(patch).length === 0) {
      throw AppError.badRequest("Không có thông tin nào để cập nhật");
    }

    const updated = await this.users.updateProfile(input.userId, patch);
    return { id: updated.id, name: updated.name, email: updated.email };
  }
}

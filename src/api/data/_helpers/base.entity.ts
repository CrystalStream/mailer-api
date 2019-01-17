import { BaseEntity, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

export abstract class AltamirEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number

  @CreateDateColumn()
  public createdAt: Date

  @UpdateDateColumn()
  public updatedAt: Date

  // soft delete
  // https://github.com/typeorm/typeorm/issues/534
  @Column({ nullable: true })
  public deletedAt: Date
}
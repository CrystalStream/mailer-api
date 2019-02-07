import { Column, Entity, Index, OneToMany } from 'typeorm'
import { AltamirEntity } from '../_helpers/base.entity'

@Entity({
  name: 'posts',
})
export class Post extends AltamirEntity {
  @Column()
  public title: string

  @Column({ nullable: true })
  public body: string
}
